import type { Request, Response } from "express";
import imagesAdminModel from "../../model/admin/imagesAdminModel";
import type { Image, ImageUpdateData } from "../../types/images";
import { buildImageUrl } from "../../utils/imageUrl";

function enrichWithImageUrl(item: Image): Image & { imageUrl: string } {
	return {
		...item,
		imageUrl: buildImageUrl(item.path) ?? item.path,
	};
}

// Liste toutes les images (admin).
// GET /admin/images
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const images: Image[] = await imagesAdminModel.findAll();
		const enriched = images.map(enrichWithImageUrl);
		res.status(200).json(enriched);
	} catch (err) {
		console.error("Erreur lors de la récupération des images (admin) :", err);
		res.sendStatus(500);
	}
};

// Récupère une image par ID (admin).
// GET /admin/images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const image: Image | null = await imagesAdminModel.findById(id);
		if (!image) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(enrichWithImageUrl(image));
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'image par ID (admin) :",
			err,
		);
		res.sendStatus(500);
	}
};

// Crée une image. user_id pris du JWT. Body : path (requis), title, description, alt_descr, is_in_gallery, article_id.
// POST /admin/images
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({ error: "Non authentifié" });
			return;
		}
		if (!req.file) {
			res.status(400).json({ error: "Fichier image requis" });
			return;
		}
		const path = `/uploads/images/${req.file.filename}`;
		const { title, description, alt_descr, is_in_gallery, article_id } =
			req.body;
		const image = await imagesAdminModel.create({
			path,
			user_id: userId,
			title: title?.trim() || null,
			description: description?.trim() || null,
			alt_descr: alt_descr?.trim() || null,
			is_in_gallery:
				req.body.is_in_gallery === "true" || req.body.is_in_gallery === "on",
			article_id:
				article_id != null && article_id !== "" ? Number(article_id) : null,
		});
		res.status(201).json(enrichWithImageUrl(image));
	} catch (err) {
		console.error("Erreur lors de la création de l'image (admin) :", err);
		res.sendStatus(500);
	}
};

// Met à jour une image. Body : champs optionnels (title, description, alt_descr, is_in_gallery, article_id). Le fichier image n'est pas modifié.
// PATCH /admin/images/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const data: ImageUpdateData = {};
		const { title, description, alt_descr, is_in_gallery, article_id } =
			req.body;
		if (title !== undefined) data.title = title ?? null;
		if (description !== undefined) data.description = description ?? null;
		if (alt_descr !== undefined) data.alt_descr = alt_descr ?? null;
		if (is_in_gallery !== undefined)
			data.is_in_gallery = Boolean(is_in_gallery);
		if (article_id !== undefined)
			data.article_id = article_id != null ? Number(article_id) : null;

		const image = await imagesAdminModel.update(id, data);
		if (!image) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(enrichWithImageUrl(image));
	} catch (err) {
		console.error("Erreur lors de la mise à jour de l'image (admin) :", err);
		res.sendStatus(500);
	}
};

// Supprime une image.
// DELETE /admin/images/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const id = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(id)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const deleted = await imagesAdminModel.deleteOne(id);
		if (!deleted) {
			res.sendStatus(404);
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		console.error("Erreur lors de la suppression de l'image (admin) :", err);
		res.sendStatus(500);
	}
};

export { browseAll, readById, add, edit, destroy };
