import type { Request, Response } from "express";

import imagesModel from "../model/imagesModel";

import type { ImageRow, Image, ImageForArticle } from "../types/images";

// Liste toutes les images de la galerie (public)
// GET /images/gallery
const browseGallery = async (req: Request, res: Response): Promise<void> => {
	try {
		const images: Image[] = await imagesModel.findGallery();
		res.status(200).json(images);
	} catch (err) {
		console.error("Erreur lors de la récupération de la galerie d'images :", err);
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

		res.status(200).json(image);
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
		res.status(200).json(images);
	} catch (err) {
		console.error("Erreur lors de la récupération des images par ID d'article :", err);
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
		res.status(200).json(images);
	} catch (err) {
		console.error("Erreur lors de la récupération des images par ID de tag :", err);
		res.sendStatus(500);
	}
};

// Type pour Image enrichie avec URL complète
interface ImageWithUrl extends Image {
	imageUrl: string;
}

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

		// Enrichir avec l'URL complète
		const IMAGE_BASE_URL =
			process.env.IMAGE_BASE_URL || "http://localhost:4242";
		const imageUrl = `${IMAGE_BASE_URL}${image.path}`;

		const imageWithUrl: ImageWithUrl = {
			...image,
			imageUrl,
		};

		res.status(200).json(imageWithUrl);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'image du jour :",
			err,
		);
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
