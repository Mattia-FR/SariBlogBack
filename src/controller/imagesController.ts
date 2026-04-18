/**
 * Controller des images (lecture publique).
 * Enrichit les Image avec imageUrl (URL complète depuis path) avant envoi.
 */
import type { Request, Response } from "express";
import imagesModel from "../model/imagesModel";
import type { Image } from "../types/images";
import { sendError } from "../utils/httpErrors";
import { buildImageUrl } from "../utils/imageUrl";
import logger from "../utils/logger";

/** Enrichit une image avec l'URL complète (path → imageUrl). */
function enrichWithImageUrl(item: Image): Image & { imageUrl: string } {
	return {
		...item,
		imageUrl: buildImageUrl(item.path) ?? item.path,
	};
}

// Liste les images de la galerie (is_in_gallery = TRUE) avec tags. Retourne Image[] + imageUrl.
// GET /images/gallery
const browseGallery = async (req: Request, res: Response): Promise<void> => {
	try {
		const images: Image[] = await imagesModel.findGallery();
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de la galerie d'images :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération de la galerie d'images",
		);
	}
};

// Récupère une image par ID. Retourne Image + imageUrl.
// GET /images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const imageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(imageId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const image: Image | null = await imagesModel.findById(imageId);
		if (!image) {
			sendError(res, 404, "Image non trouvée");
			return;
		}

		const enrichedImage = enrichWithImageUrl(image);
		res.status(200).json(enrichedImage);
	} catch (err) {
		logger.error("Erreur lors de la récupération de l'image par ID :", err);
		sendError(res, 500, "Erreur lors de la récupération de l'image par ID");
	}
};

// Récupère les images associées à un article par ID. Retourne Image[] + imageUrl.
// GET /images/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const images: Image[] = await imagesModel.findByArticleId(articleId);
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des images par ID d'article :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des images par ID d'article",
		);
	}
};

// Récupère les images associées à un tag par ID. Retourne Image[] + imageUrl.
// GET /images/tag/:tagId
const readByTag = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.tagId, 10);
		if (Number.isNaN(tagId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const images: Image[] = await imagesModel.findByTagId(tagId);
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des images par ID de tag :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des images par ID de tag",
		);
	}
};

// Récupère les images de la galerie associées à une catégorie par ID (paginé). Retourne { images, total, page, limit } + imageUrl.
// GET /images/category/:categoryId?page=1&limit=10
const readByCategoryId = async (req: Request, res: Response): Promise<void> => {
	try {
		const categoryId: number = Number.parseInt(req.params.categoryId, 10);
		if (Number.isNaN(categoryId)) {
			sendError(res, 400, "ID de catégorie invalide");
			return;
		}

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

		const { images, total } = await imagesModel.findByCategoryId(
			categoryId,
			page,
			limit,
			tagId,
		);
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json({
			images: enrichedImages,
			total,
			page,
			limit,
		});
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des images par ID de catégorie :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération des images par ID de catégorie",
		);
	}
};

// Récupère l'image du jour (galerie, déterministe par jour de l'année). Retourne Image + imageUrl.
// GET /images/image-of-the-day
const readImageOfTheDay = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const image = await imagesModel.findImageOfTheDay();

		if (!image) {
			sendError(res, 404, "Aucune image disponible dans la galerie");
			return;
		}

		const enrichedImage = enrichWithImageUrl(image);
		res.status(200).json(enrichedImage);
	} catch (err) {
		logger.error("Erreur lors de la récupération de l'image du jour :", err);
		sendError(res, 500, "Erreur lors de la récupération de l'image du jour");
	}
};

export {
	browseGallery,
	readById,
	readByArticleId,
	readByTag,
	readByCategoryId,
	readImageOfTheDay,
};
