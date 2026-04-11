import type { Request, Response } from "express";

import tagsModel from "../model/tagsModel";

import type { Tag } from "../types/tags";
import { sendError } from "../utils/httpErrors";
import logger from "../utils/logger";

// Tags utilisés sur au moins un article publié (public, filtre blog).
// GET /tags/published-articles
const browseUsedOnPublishedArticles = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const tags: Tag[] = await tagsModel.findUsedOnPublishedArticles();
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags des articles publiés :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des tags des articles publiés",
		);
	}
};

// Tags utilisés sur au moins une image de galerie dans une catégorie (public).
// GET /tags/category/:categoryId
const readUsedOnGalleryByCategoryId = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const categoryId: number = Number.parseInt(req.params.categoryId, 10);
		if (Number.isNaN(categoryId)) {
			sendError(res, 400, "ID de catégorie invalide");
			return;
		}

		const tags: Tag[] =
			await tagsModel.findUsedOnGalleryImagesByCategoryId(categoryId);
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags de galerie par catégorie :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des tags de galerie par catégorie",
		);
	}
};

// Récupère tous les tags associés à un article par son ID (public)
// GET /tags/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const tags: Tag[] = await tagsModel.findByArticleId(articleId);
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags par ID d'article :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération des tags par ID d'article");
	}
};

// Récupère tous les tags associés à une image par son ID (public)
// GET /tags/image/:imageId
const readByImageId = async (req: Request, res: Response): Promise<void> => {
	try {
		const imageId: number = Number.parseInt(req.params.imageId, 10);
		if (Number.isNaN(imageId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const tags: Tag[] = await tagsModel.findByImageId(imageId);
		res.status(200).json(tags);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des tags par ID d'image :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération des tags par ID d'image");
	}
};

export {
	browseUsedOnPublishedArticles,
	readByArticleId,
	readByImageId,
	readUsedOnGalleryByCategoryId,
};
