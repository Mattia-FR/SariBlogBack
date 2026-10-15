import type { Request, Response } from "express";

import tagsModel from "../model/tagsModel";

import type { Tag } from "../types/tags";
import { parseIdParam } from "../utils/requestParams";

// Tags utilisés sur au moins un article publié (public, filtre blog).
// GET /tags/published-articles
const browseUsedOnPublishedArticles = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const tags: Tag[] = await tagsModel.findUsedOnPublishedArticles();
	res.status(200).json(tags);
};

// Tags utilisés sur au moins une image de galerie dans une catégorie (public).
// GET /tags/category/:categoryId
const readUsedOnGalleryByCategoryId = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const categoryId = parseIdParam(
		req.params.categoryId,
		"ID de catégorie invalide",
	);
	const tags: Tag[] =
		await tagsModel.findUsedOnGalleryImagesByCategoryId(categoryId);
	res.status(200).json(tags);
};

// Récupère tous les tags associés à un article par son ID (public)
// GET /tags/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.articleId);
	const tags: Tag[] = await tagsModel.findByArticleId(articleId);
	res.status(200).json(tags);
};

// Récupère tous les tags associés à une image par son ID (public)
// GET /tags/image/:imageId
const readByImageId = async (req: Request, res: Response): Promise<void> => {
	const imageId = parseIdParam(req.params.imageId);
	const tags: Tag[] = await tagsModel.findByImageId(imageId);
	res.status(200).json(tags);
};

export {
	browseUsedOnPublishedArticles,
	readByArticleId,
	readByImageId,
	readUsedOnGalleryByCategoryId,
};
