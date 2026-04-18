import type { Request, Response } from "express";
import tagsAdminModel from "../../model/admin/tagsAdminModel";
import type { Tag } from "../../types/tags";
import { sendError } from "../../utils/httpErrors";
import logger from "../../utils/logger";
import { buildSlug } from "../../utils/slug";

// Liste tous les tags (y compris non utilisés).
// GET /admin/tags
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const tags: Tag[] = await tagsAdminModel.findAll();
		res.status(200).json(tags);
	} catch (err) {
		logger.error("Erreur lors de la récupération des tags (admin) :", err);
		sendError(res, 500, "Erreur lors de la récupération des tags");
	}
};

// Tags utilisés sur au moins un article (tous statuts), filtre liste articles admin.
// GET /admin/tags/used-on-articles
const browseUsedOnArticles = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const tags: Tag[] = await tagsAdminModel.findUsedOnArticles();
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags utilisés sur des articles :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des tags utilisés sur des articles",
		);
	}
};

// Tags utilisés sur au moins une image (filtre liste images admin).
// GET /admin/tags/used-on-images
const browseUsedOnImages = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const tags: Tag[] = await tagsAdminModel.findUsedOnImages();
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags utilisés sur des images :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des tags utilisés sur des images",
		);
	}
};

// Récupère un tag par ID.
// GET /admin/tags/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const tag: Tag | null = await tagsAdminModel.findById(tagId);
		if (!tag) {
			sendError(res, 404, "Tag non trouvé");
			return;
		}
		res.status(200).json(tag);
	} catch (err) {
		logger.error("Erreur lors de la récupération du tag par ID (admin) :", err);
		sendError(res, 500, "Erreur lors de la récupération du tag");
	}
};

// Crée un tag. Body : name (requis), slug (optionnel, déduit du name si absent).
// POST /admin/tags
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
		if (!name) {
			sendError(res, 400, "Le nom est requis");
			return;
		}
		const slugProvided =
			req.body.slug && typeof req.body.slug === "string"
				? req.body.slug.trim()
				: "";
		let slug: string;
		if (slugProvided) {
			slug = buildSlug(slugProvided);
			if (!slug) {
				sendError(res, 400, "Slug invalide");
				return;
			}
		} else {
			slug = buildSlug(name);
		}

		const newTag: Tag = await tagsAdminModel.create({ name, slug });
		res.status(201).json(newTag);
	} catch (err) {
		logger.error("Erreur lors de la création du tag (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Un tag avec ce nom ou ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la création du tag");
	}
};

// Met à jour un tag. Body : name et/ou slug (optionnels, mise à jour partielle).
// PATCH /admin/tags/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const data: { name?: string; slug?: string } = {};
		const { name, slug } = req.body;
		if (name !== undefined) {
			const trimmed = typeof name === "string" ? name.trim() : "";
			if (trimmed) data.name = trimmed;
		}
		if (slug !== undefined) {
			const trimmed = typeof slug === "string" ? slug.trim() : "";
			if (trimmed) {
				const sanitized = buildSlug(trimmed);
				if (!sanitized) {
					sendError(res, 400, "Slug invalide");
					return;
				}
				data.slug = sanitized;
			}
		}

		if (Object.keys(data).length === 0) {
			sendError(
				res,
				400,
				"Au moins un champ (name ou slug) doit être fourni et non vide",
			);
			return;
		}

		const updatedTag: Tag | null = await tagsAdminModel.update(tagId, data);
		if (!updatedTag) {
			sendError(res, 404, "Tag non trouvé");
			return;
		}
		res.status(200).json(updatedTag);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour du tag (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Un tag avec ce nom ou ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la mise à jour du tag");
	}
};

// Supprime un tag par ID.
// DELETE /admin/tags/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const deleted: boolean = await tagsAdminModel.deleteOne(tagId);
		if (!deleted) {
			sendError(res, 404, "Tag non trouvé");
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression du tag (admin) :", err);
		sendError(res, 500, "Erreur lors de la suppression du tag");
	}
};

export {
	browseAll,
	browseUsedOnArticles,
	browseUsedOnImages,
	readById,
	add,
	edit,
	destroy,
};
