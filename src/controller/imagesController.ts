import type { Request, Response } from "express";
import imagesModel from "../model/imagesModel";
import type { Image, ImageForArticle } from "../types/images";

// Configuration de l'URL de base pour les images
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

// Types pour les images enrichies avec URL complète
interface ImageWithUrl extends Image {
	imageUrl: string;
}

interface ImageForArticleWithUrl extends ImageForArticle {
	imageUrl: string;
}

/**
 * Fonction utilitaire pour enrichir une image avec son URL complète
 */
function enrichImageWithUrl(image: Image): ImageWithUrl {
	return {
		...image,
		imageUrl: `${IMAGE_BASE_URL}${image.path}`,
	};
}

/**
 * Fonction utilitaire pour enrichir une image d'article avec son URL complète
 */
function enrichImageForArticleWithUrl(
	image: ImageForArticle,
): ImageForArticleWithUrl {
	return {
		...image,
		imageUrl: `${IMAGE_BASE_URL}${image.path}`,
	};
}

// Liste toutes les images de la galerie (public)
// GET /images/gallery
const browseGallery = async (req: Request, res: Response): Promise<void> => {
	try {
		const images: Image[] = await imagesModel.findGallery();
		const enrichedImages = images.map(enrichImageWithUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de la galerie d'images :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère une image par ID (public)
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

		const enrichedImage = enrichImageWithUrl(image);
		res.status(200).json(enrichedImage);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image par ID :", err);
		res.sendStatus(500);
	}
};

// Récupère toutes les images associées à un article par son ID (public)
// GET /images/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const images: ImageForArticle[] =
			await imagesModel.findByArticleId(articleId);
		const enrichedImages = images.map(enrichImageForArticleWithUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID d'article :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère toutes les images associées à un tag par son ID (public)
// GET /images/tag/:tagId
const readByTag = async (req: Request, res: Response): Promise<void> => {
	try {
		const tagId: number = Number.parseInt(req.params.tagId, 10);
		if (Number.isNaN(tagId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const images: Image[] = await imagesModel.findByTagId(tagId);
		const enrichedImages = images.map(enrichImageWithUrl);
		res.status(200).json(enrichedImages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID de tag :",
			err,
		);
		res.sendStatus(500);
	}
};

/**
 * Retourne l'image du jour
 * GET /images/image-of-the-day
 *
 * Retourne l'image du jour avec l'URL complète enrichie.
 * L'image change automatiquement à minuit basée sur le jour de l'année.
 */
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

		const enrichedImage = enrichImageWithUrl(image);
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
