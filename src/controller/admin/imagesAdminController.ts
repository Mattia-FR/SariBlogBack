import fs from "node:fs/promises";
import path from "node:path";
import type { Request, Response } from "express";
import imagesAdminModel from "../../model/admin/imagesAdminModel";
import type { Image, ImageUpdateData } from "../../types/images";
import { sendError } from "../../utils/httpErrors";
import { buildImageUrl } from "../../utils/imageUrl";
import logger from "../../utils/logger";

function enrichWithImageUrl(item: Image): Image & { imageUrl: string } {
	return {
		...item,
		imageUrl: buildImageUrl(item.path) ?? item.path,
	};
}

// Liste les images (admin), paginée. Query : page, limit (1–20), tagId optionnel.
// GET /admin/images?page=1&limit=10&tagId=2
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number.parseInt(req.query.page as string, 10) || 1;
		const limit = Number.parseInt(req.query.limit as string, 10) || 10;

		if (page < 1) {
			sendError(res, 400, "Le paramètre page doit être un nombre positif");
			return;
		}
		if (limit < 1 || limit > 20) {
			sendError(res, 400, "Le paramètre limit doit être entre 1 et 20");
			return;
		}

		let tagId: number | undefined;
		const tagIdRaw = req.query.tagId;
		if (tagIdRaw !== undefined && tagIdRaw !== "") {
			const parsed = Number.parseInt(String(tagIdRaw), 10);
			if (Number.isNaN(parsed) || parsed < 1) {
				sendError(res, 400, "Le paramètre tagId doit être un nombre positif");
				return;
			}
			tagId = parsed;
		}

		const { images, total } = await imagesAdminModel.findAllPaginated(
			page,
			limit,
			tagId,
		);
		const enriched = images.map(enrichWithImageUrl);
		res.status(200).json({
			images: enriched,
			total,
			page,
			limit,
		});
	} catch (err) {
		logger.error("Erreur lors de la récupération des images (admin) :", err);
		sendError(res, 500, "Erreur lors de la récupération des images");
	}
};

// Récupère une image par ID (admin).
// GET /admin/images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const image: Image | null = await imagesAdminModel.findById(id);
		if (!image) {
			sendError(res, 404, "Image non trouvée");
			return;
		}
		res.status(200).json(enrichWithImageUrl(image));
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de l'image par ID (admin) :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération de l'image");
	}
};

// Crée une image. user_id pris du JWT. Body : path (requis), title, description, alt_descr, is_in_gallery, article_id, category_id.
// POST /admin/images
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			sendError(res, 401, "Non authentifié");
			return;
		}
		if (!req.file) {
			sendError(res, 400, "Fichier image requis");
			return;
		}
		const path = `/uploads/images/${req.file.filename}`;
		const { title, description, alt_descr, article_id, category_id } = req.body;
		let tagIds: number[] = [];
		if (Array.isArray(req.body.tag_ids)) {
			tagIds = req.body.tag_ids
				.map((id: unknown) => Number(id))
				.filter((id: number) => !Number.isNaN(id));
		} else if (typeof req.body.tag_ids === "string") {
			try {
				const parsed = JSON.parse(req.body.tag_ids) as unknown[];
				tagIds = Array.isArray(parsed)
					? parsed.map((id) => Number(id)).filter((id) => !Number.isNaN(id))
					: [];
			} catch {
				// ignore invalid JSON
			}
		}
		const isInGallery =
			req.body.is_in_gallery === "true" || req.body.is_in_gallery === "on";
		let resolvedCategoryId: number | null =
			category_id != null && category_id !== "" ? Number(category_id) : null;
		if (!isInGallery) {
			resolvedCategoryId = null;
		} else if (
			resolvedCategoryId === null ||
			Number.isNaN(resolvedCategoryId) ||
			resolvedCategoryId < 1
		) {
			sendError(
				res,
				400,
				"Une catégorie est requise pour une image affichée dans la galerie",
			);
			return;
		}

		const image = await imagesAdminModel.create({
			path,
			user_id: userId,
			title: title?.trim() || null,
			description: description?.trim() || null,
			alt_descr: alt_descr?.trim() || null,
			is_in_gallery: isInGallery,
			article_id:
				article_id != null && article_id !== "" ? Number(article_id) : null,
			category_id: resolvedCategoryId,
			tag_ids: tagIds.length > 0 ? tagIds : undefined,
		});
		res.status(201).json(enrichWithImageUrl(image));
	} catch (err) {
		logger.error("Erreur lors de la création de l'image (admin) :", err);
		sendError(res, 500, "Erreur lors de la création de l'image");
	}
};

// Met à jour une image. Body : champs optionnels (title, description, alt_descr, is_in_gallery, article_id, category_id). Le fichier image n'est pas modifié.
// PATCH /admin/images/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const existing = await imagesAdminModel.findById(id);
		if (!existing) {
			sendError(res, 404, "Image non trouvée");
			return;
		}

		const data: ImageUpdateData = {};
		const {
			title,
			description,
			alt_descr,
			is_in_gallery,
			article_id,
			category_id,
		} = req.body;
		if (title !== undefined) data.title = title ?? null;
		if (description !== undefined) data.description = description ?? null;
		if (alt_descr !== undefined) data.alt_descr = alt_descr ?? null;
		if (is_in_gallery !== undefined)
			data.is_in_gallery = Boolean(is_in_gallery);
		if (article_id !== undefined)
			data.article_id = article_id != null ? Number(article_id) : null;
		if (category_id !== undefined)
			data.category_id = category_id != null ? Number(category_id) : null;
		if (req.body.tag_ids !== undefined) {
			const tagIds = Array.isArray(req.body.tag_ids)
				? req.body.tag_ids
						.map((id: unknown) => Number(id))
						.filter((id: number) => !Number.isNaN(id))
				: [];
			data.tag_ids = tagIds;
		}

		const finalInGallery =
			data.is_in_gallery !== undefined
				? data.is_in_gallery
				: existing.is_in_gallery;
		if (!finalInGallery) {
			data.category_id = null;
		} else {
			const mergedCategoryId =
				data.category_id !== undefined
					? data.category_id
					: existing.category_id;
			if (
				mergedCategoryId === null ||
				mergedCategoryId === undefined ||
				Number.isNaN(Number(mergedCategoryId)) ||
				Number(mergedCategoryId) < 1
			) {
				sendError(
					res,
					400,
					"Une catégorie est requise pour une image affichée dans la galerie",
				);
				return;
			}
		}

		const image = await imagesAdminModel.update(id, data);
		if (!image) {
			sendError(res, 404, "Image non trouvée");
			return;
		}
		res.status(200).json(enrichWithImageUrl(image));
	} catch (err) {
		logger.error("Erreur lors de la mise à jour de l'image (admin) :", err);
		sendError(res, 500, "Erreur lors de la mise à jour de l'image");
	}
};

// Supprime une image.
// DELETE /admin/images/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const image = await imagesAdminModel.findById(id);
		if (!image) {
			sendError(res, 404, "Image non trouvée");
			return;
		}

		const deleted = await imagesAdminModel.deleteOne(id);
		if (!deleted) {
			sendError(res, 404, "Image non trouvée");
			return;
		}

		// `image.path` contient un chemin serveur (ex: `/uploads/images/abc.jpg`).
		// En dev, Multer écrit dans `./uploads/images` (relatif au `cwd` du processus),
		// donc on reconstruit un chemin disque compatible Windows.
		const relativeImagePath = image.path.replace(/^\/+/, "");
		const fullPath = path.join(process.cwd(), relativeImagePath);
		try {
			await fs.unlink(fullPath);
		} catch (unlinkErr) {
			const err = unlinkErr as NodeJS.ErrnoException;
			// ENOENT = "file not found" : le fichier n'existe pas (déjà supprimé, ou chemin correct mais absent).
			// On l'ignore pour que la suppression DB reste idempotente côté API.
			// (suppression DB ok même si le fichier n’est déjà plus là)
			if (err?.code !== "ENOENT") {
				logger.error("Erreur lors de la suppression du fichier image :", err);
			}
		}

		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression de l'image (admin) :", err);
		sendError(res, 500, "Erreur lors de la suppression de l'image");
	}
};

export { browseAll, readById, add, edit, destroy };
