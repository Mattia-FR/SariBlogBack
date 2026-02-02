/**
 * Controller des images (lecture publique).
 * Enrichit les Image avec imageUrl (URL complète depuis path) avant envoi.
 */
import type { Request, Response } from "express";
import imagesModel from "../model/imagesModel";
import type { Image } from "../types/images";

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

/** Enrichit une image avec l'URL complète (path → imageUrl). */
function enrichWithImageUrl(item: Image): Image & { imageUrl: string } {
	return {
		...item,
		imageUrl: `${IMAGE_BASE_URL}${item.path}`,
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
		console.error(
			"Erreur lors de la récupération de la galerie d'images :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère une image par ID. Retourne Image + imageUrl.
// GET /images/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const imageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(imageId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const image: Image | null = await imagesModel.findById(imageId);
		if (!image) {
			res.sendStatus(404);
			return;
		}

		const enrichedImage = enrichWithImageUrl(image);
		res.status(200).json(enrichedImage);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image par ID :", err);
		res.sendStatus(500);
	}
};

// Récupère les images associées à un article par ID. Retourne Image[] + imageUrl.
// GET /images/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const images: Image[] = await imagesModel.findByArticleId(articleId);
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID d'article :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère les images associées à un tag par ID. Retourne Image[] + imageUrl.
// GET /images/tag/:tagId
const readByTag = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.tagId, 10);
		if (Number.isNaN(tagId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const images: Image[] = await imagesModel.findByTagId(tagId);
		const enrichedImages = images.map(enrichWithImageUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID de tag :",
			err,
		);
		res.sendStatus(500);
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
			res.status(404).json({
				error: "Aucune image disponible dans la galerie",
			});
			return;
		}

		const enrichedImage = enrichWithImageUrl(image);
		res.status(200).json(enrichedImage);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image du jour :", err);
		res.sendStatus(500);
	}
};

export {
	browseGallery,
	readById,
	readByArticleId,
	readByTag,
	readImageOfTheDay,
};
