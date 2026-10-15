import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import imagesAdminModel from "../../model/admin/imagesAdminModel";
import type { Image, ImageUpdateData } from "../../types/images";
import { assertAllowedImageFile } from "../../utils/assertAllowedImageFile";
import { HttpError } from "../../utils/httpErrors";
import {
	buildImageUrl,
	buildThumbUrl,
	toThumbPath,
} from "../../utils/imageUrl";
import logger from "../../utils/logger";
import { processUploadedImage } from "../../utils/processUploadedImage";
import {
	assertPageInRange,
	parseIdParam,
	parseOptionalIdQuery,
	parsePaginationParams,
} from "../../utils/requestParams";

function enrichWithImageUrl(
	item: Image,
): Image & { imageUrl: string; thumbUrl: string } {
	return {
		...item,
		imageUrl: buildImageUrl(item.path) ?? item.path,
		thumbUrl: buildThumbUrl(item.path) ?? item.path,
	};
}

function ridPrefix(requestId?: string): string {
	return requestId ? `[${requestId}] ` : "";
}

/** Supprime un fichier sans échouer s'il n'existe déjà plus. */
async function removeFile(filePath: string, requestId?: string): Promise<void> {
	try {
		await fs.unlink(filePath);
	} catch (err) {
		if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
			logger.error(
				`${ridPrefix(requestId)}Suppression du fichier impossible : ${filePath}`,
				err,
			);
		}
	}
}

const GALLERY_CATEGORY_REQUIRED =
	"Une catégorie est requise pour une image affichée dans la galerie";

// Liste les images (admin), paginée. Query : page, limit (1–20), tagId optionnel.
// GET /admin/images?page=1&limit=10&tagId=2
const browseAll = async (req: Request, res: Response): Promise<void> => {
	const { page, limit } = parsePaginationParams(req.query);
	const tagId = parseOptionalIdQuery(req.query.tagId, "tagId");

	const { images, total } = await imagesAdminModel.findAllPaginated(
		page,
		limit,
		tagId,
	);
	assertPageInRange(page, limit, total);
	res.status(200).json({
		images: images.map(enrichWithImageUrl),
		total,
		page,
		limit,
	});
};

// Récupère une image par ID (admin).
// GET /admin/images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const id = parseIdParam(req.params.id);
	const image: Image | null = await imagesAdminModel.findById(id);
	if (!image) {
		throw new HttpError(404, "Image non trouvée");
	}
	res.status(200).json(enrichWithImageUrl(image));
};

// Crée une image. user_id pris du JWT. Body validé par imageCreateBodySchema (après multer).
// POST /admin/images
const add = async (req: Request, res: Response): Promise<void> => {
	if (!req.file) {
		throw new HttpError(400, "Fichier image requis");
	}
	const tmpPath = req.file.path;

	// Tant que l'image n'est pas enregistrée en base, tout échec doit supprimer le fichier temporaire.
	let filename: string;
	let input: {
		userId: number;
		tagIds: number[];
		isInGallery: boolean;
		categoryId: number | null;
		articleId: number | null;
	};
	try {
		const userId = req.user?.userId;
		if (!userId) {
			throw new HttpError(401, "Non authentifié");
		}

		const { tag_ids, is_in_gallery, category_id, article_id } = req.body;

		input = {
			userId,
			tagIds: tag_ids ?? [],
			isInGallery: is_in_gallery,
			categoryId: is_in_gallery ? (category_id ?? null) : null,
			articleId: article_id ?? null,
		};

		try {
			await assertAllowedImageFile(tmpPath);
		} catch {
			throw new HttpError(
				400,
				"Format de fichier non autorisé",
				"INVALID_FILE_TYPE",
			);
		}

		try {
			filename = await processUploadedImage(tmpPath);
		} catch (err) {
			logger.warn(
				`${ridPrefix(req.requestId)}Traitement image (Sharp) impossible :`,
				err,
			);
			throw new HttpError(
				400,
				"Fichier image invalide ou illisible",
				"INVALID_FILE_TYPE",
			);
		}
	} catch (err) {
		await removeFile(tmpPath, req.requestId);
		throw err;
	}

	const { title, description, alt_descr } = req.body;
	const publicPath = `/uploads/images/${filename}`;

	try {
		const image = await imagesAdminModel.create({
			path: publicPath,
			user_id: input.userId,
			title: title ?? null,
			description: description ?? null,
			alt_descr: alt_descr ?? null,
			is_in_gallery: input.isInGallery,
			article_id: input.articleId,
			category_id: input.categoryId,
			tag_ids: input.tagIds.length > 0 ? input.tagIds : undefined,
		});
		res.status(201).json(enrichWithImageUrl(image));
	} catch (err) {
		const dir = path.dirname(tmpPath);
		const fullPath = path.join(dir, filename);
		await removeFile(fullPath, req.requestId);
		await removeFile(
			path.join(dir, path.basename(toThumbPath(filename))),
			req.requestId,
		);
		throw err;
	}
};

// Met à jour une image. Body : champs optionnels (métadonnées uniquement).
// PATCH /admin/images/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	const id = parseIdParam(req.params.id);
	const existing = await imagesAdminModel.findById(id);
	if (!existing) {
		throw new HttpError(404, "Image non trouvée");
	}

	const data: ImageUpdateData = {};
	const {
		title,
		description,
		alt_descr,
		is_in_gallery,
		article_id,
		category_id,
		tag_ids,
	} = req.body;

	if (title !== undefined) data.title = title;
	if (description !== undefined) data.description = description;
	if (alt_descr !== undefined) data.alt_descr = alt_descr;
	if (is_in_gallery !== undefined) data.is_in_gallery = is_in_gallery;
	if (article_id !== undefined) data.article_id = article_id;
	if (category_id !== undefined) data.category_id = category_id;
	if (tag_ids !== undefined) data.tag_ids = tag_ids;

	const finalInGallery =
		data.is_in_gallery !== undefined
			? data.is_in_gallery
			: existing.is_in_gallery;
	if (!finalInGallery) {
		data.category_id = null;
	} else {
		const mergedCategoryId =
			data.category_id !== undefined ? data.category_id : existing.category_id;
		if (mergedCategoryId == null) {
			throw new HttpError(400, GALLERY_CATEGORY_REQUIRED);
		}
	}

	const image = await imagesAdminModel.update(id, data);
	if (!image) {
		throw new HttpError(404, "Image non trouvée");
	}
	res.status(200).json(enrichWithImageUrl(image));
};

// Supprime une image.
// DELETE /admin/images/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const id = parseIdParam(req.params.id);

	const image = await imagesAdminModel.findById(id);
	if (!image) {
		throw new HttpError(404, "Image non trouvée");
	}

	const deleted = await imagesAdminModel.deleteOne(id);
	if (!deleted) {
		throw new HttpError(404, "Image non trouvée");
	}

	// `image.path` contient un chemin public (ex: `/uploads/images/abc.webp`), relatif au `cwd` du processus.
	// La suppression DB fait foi : un fichier déjà absent n'empêche pas la réponse 204.
	const relativeImagePath = image.path.replace(/^\/+/, "");
	const relativeThumbPath = toThumbPath(image.path).replace(/^\/+/, "");
	await removeFile(path.join(process.cwd(), relativeImagePath), req.requestId);
	await removeFile(path.join(process.cwd(), relativeThumbPath), req.requestId);

	res.sendStatus(204);
};

export { browseAll, readById, add, edit, destroy };
