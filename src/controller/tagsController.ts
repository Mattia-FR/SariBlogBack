import type { Request, Response } from "express";

import tagsModel from "../model/tagsModel";

import type { Tag } from "../types/tags";

// Liste tous les tags (public)
// GET /tags
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const tags: Tag[] = await tagsModel.findAll();
		res.status(200).json(tags);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les tags :", err);
		res.sendStatus(500);
	}
};

// Récupère tous les tags associés à un article par son ID (public)
// GET /tags/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const tags: Tag[] = await tagsModel.findByArticleId(articleId);
		res.status(200).json(tags);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'article :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère tous les tags associés à une image par son ID (public)
// GET /tags/image/:imageId
const readByImageId = async (req: Request, res: Response): Promise<void> => {
	try {
		const imageId: number = Number.parseInt(req.params.imageId, 10);
		if (Number.isNaN(imageId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const tags: Tag[] = await tagsModel.findByImageId(imageId);
		res.status(200).json(tags);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'image :",
			err,
		);
		res.sendStatus(500);
	}
};

export { browseAll, readByArticleId, readByImageId };
