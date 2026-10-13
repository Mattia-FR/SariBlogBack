/**
 * Controller des images (lecture publique).
 * Enrichit les Image avec imageUrl (URL complète depuis path) avant envoi.
 */
import type { Request, Response } from "express";
import imagesModel from "../model/imagesModel";
import type { Image } from "../types/images";
import { HttpError } from "../utils/httpErrors";
import { buildImageUrl } from "../utils/imageUrl";
import {
	parseIdParam,
	parseOptionalIdQuery,
	parsePaginationParams,
} from "../utils/requestParams";

/** Enrichit une image avec l'URL complète (path → imageUrl). */
function enrichWithImageUrl(item: Image): Image & { imageUrl: string } {
	return {
		...item,
		imageUrl: buildImageUrl(item.path) ?? item.path,
	};
}

// Liste les images de la galerie (is_in_gallery = TRUE) avec tags. Retourne Image[] + imageUrl.
// GET /images/gallery
const browseGallery = async (_req: Request, res: Response): Promise<void> => {
	const images: Image[] = await imagesModel.findGallery();
	res.status(200).json(images.map(enrichWithImageUrl));
};

// Récupère une image par ID. Retourne Image + imageUrl.
// GET /images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const imageId = parseIdParam(req.params.id);
	const image: Image | null = await imagesModel.findById(imageId);
	if (!image) {
		throw new HttpError(404, "Image non trouvée");
	}
	res.status(200).json(enrichWithImageUrl(image));
};

// Récupère les images associées à un article par ID. Retourne Image[] + imageUrl.
// GET /images/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.articleId);
	const images: Image[] = await imagesModel.findByArticleId(articleId);
	res.status(200).json(images.map(enrichWithImageUrl));
};

// Récupère les images associées à un tag par ID. Retourne Image[] + imageUrl.
// GET /images/tag/:tagId
const readByTag = async (req: Request, res: Response): Promise<void> => {
	const tagId = parseIdParam(req.params.tagId);
	const images: Image[] = await imagesModel.findByTagId(tagId);
	res.status(200).json(images.map(enrichWithImageUrl));
};

// Récupère les images de la galerie associées à une catégorie par ID (paginé). Retourne { images, total, page, limit } + imageUrl.
// GET /images/category/:categoryId?page=1&limit=9
const readByCategoryId = async (req: Request, res: Response): Promise<void> => {
	const categoryId = parseIdParam(
		req.params.categoryId,
		"ID de catégorie invalide",
	);
	const { page, limit } = parsePaginationParams(req.query, 9);
	const tagId = parseOptionalIdQuery(req.query.tagId, "tagId");

	const { images, total } = await imagesModel.findByCategoryId(
		categoryId,
		page,
		limit,
		tagId,
	);
	res.status(200).json({
		images: images.map(enrichWithImageUrl),
		total,
		page,
		limit,
	});
};

// Récupère l'image du jour (galerie, déterministe par jour de l'année). Retourne Image + imageUrl.
// GET /images/image-of-the-day
const readImageOfTheDay = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const image = await imagesModel.findImageOfTheDay();
	if (!image) {
		throw new HttpError(404, "Aucune image disponible dans la galerie");
	}
	res.status(200).json(enrichWithImageUrl(image));
};

export {
	browseGallery,
	readById,
	readByArticleId,
	readByTag,
	readByCategoryId,
	readImageOfTheDay,
};
