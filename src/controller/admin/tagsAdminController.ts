import type { Request, Response } from "express";
import tagsAdminModel from "../../model/admin/tagsAdminModel";
import type { Tag } from "../../types/tags";
import { buildSlug } from "../../utils/slug";
import logger from "../../utils/logger";

// Liste tous les tags (y compris non utilisés).
// GET /admin/tags
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const tags: Tag[] = await tagsAdminModel.findAll();
		res.status(200).json(tags);
	} catch (err) {
		logger.error("Erreur lors de la récupération des tags (admin) :", err);
		res.status(500).json({ error: "Erreur lors de la récupération des tags" });
	}
};

// Récupère un tag par ID.
// GET /admin/tags/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const tag: Tag | null = await tagsAdminModel.findById(tagId);
		if (!tag) {
			res.status(404).json({ error: "Tag non trouvé" });
			return;
		}
		res.status(200).json(tag);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération du tag par ID (admin) :",
			err,
		);
		res.status(500).json({ error: "Erreur lors de la récupération du tag" });
	}
};

// Crée un tag. Body : name (requis), slug (optionnel, déduit du name si absent).
// POST /admin/tags
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
		if (!name) {
			res.status(400).json({ error: "Le nom est requis" });
			return;
		}
		const slugProvided =
			req.body.slug && typeof req.body.slug === "string"
				? req.body.slug.trim()
				: "";
		const slug = slugProvided || buildSlug(name);

		const newTag: Tag = await tagsAdminModel.create({ name, slug });
		res.status(201).json(newTag);
	} catch (err) {
		logger.error("Erreur lors de la création du tag (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			res.status(409).json({
				error: "Un tag avec ce nom ou ce slug existe déjà",
			});
			return;
		}

		res.status(500).json({ error: "Erreur lors de la création du tag" });
	}
};

// Met à jour un tag. Body : name et/ou slug (optionnels, mise à jour partielle).
// PATCH /admin/tags/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			res.status(400).json({ error: "ID invalide" });
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
			if (trimmed) data.slug = trimmed;
		}

		if (Object.keys(data).length === 0) {
			res.status(400).json({
				error: "Au moins un champ (name ou slug) doit être fourni et non vide",
			});
			return;
		}

		const updatedTag: Tag | null = await tagsAdminModel.update(tagId, data);
		if (!updatedTag) {
			res.status(404).json({ error: "Tag non trouvé" });
			return;
		}
		res.status(200).json(updatedTag);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour du tag (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			res.status(409).json({
				error: "Un tag avec ce nom ou ce slug existe déjà",
			});
			return;
		}

		res.status(500).json({ error: "Erreur lors de la mise à jour du tag" });
	}
};

// Supprime un tag par ID.
// DELETE /admin/tags/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(tagId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const deleted: boolean = await tagsAdminModel.deleteOne(tagId);
		if (!deleted) {
			res.status(404).json({ error: "Tag non trouvé" });
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression du tag (admin) :", err);
		res.status(500).json({ error: "Erreur lors de la suppression du tag" });
	}
};

export { browseAll, readById, add, edit, destroy };
