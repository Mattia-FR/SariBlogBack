/**
 * Controller des articles (public et admin lecture).
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 */
import type { Request, Response } from "express";
import articlesModel from "../model/articlesModel";
import articlesAdminModel from "../model/admin/articlesAdminModel";
import type { Article } from "../types/articles";

// Liste tous les articles (admin - tous statuts). Retourne Article[] sans content.
// GET /articles
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: Article[] = await articlesAdminModel.findAllForAdmin();
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les articles :", err);
		res.sendStatus(500);
	}
};

// Récupère un article par ID (admin - tous statuts). Retourne Article avec content et imageUrl.
// GET /articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const article: Article | null =
			await articlesAdminModel.findByIdForAdmin(articleId);
		if (!article) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'article par ID :", err);
		res.sendStatus(500);
	}
};

// Récupère un article par slug (admin - tous statuts). Retourne Article avec content et imageUrl.
// GET /articles/slug/:slug
const readBySlug = async (req: Request, res: Response): Promise<void> => {
	try {
		const slug: string = req.params.slug;
		if (!slug) {
			res.status(400).json({ error: "Slug invalide" });
			return;
		}

		const article: Article | null =
			await articlesAdminModel.findBySlugForAdmin(slug);
		if (!article) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article par slug :",
			err,
		);
		res.sendStatus(500);
	}
};

// Liste les articles publiés (public). Option limit (max 20). Retourne Article[] avec imageUrl et tags.
// GET /articles/published?limit=4
const browsePublished = async (req: Request, res: Response): Promise<void> => {
	try {
		const limitParam = req.query.limit;
		const limit = limitParam
			? Number.parseInt(limitParam as string, 10)
			: undefined;

		if (limit !== undefined) {
			if (Number.isNaN(limit) || limit < 1) {
				res
					.status(400)
					.json({ error: "Le paramètre limit doit être un nombre positif" });
				return;
			}
			if (limit > 20) {
				res
					.status(400)
					.json({ error: "Le paramètre limit ne peut pas dépasser 20" });
				return;
			}
		}

		let articles: Article[] = await articlesModel.findPublished();
		if (limit !== undefined) {
			articles = articles.slice(0, limit);
		}
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés :", err);
		res.sendStatus(500);
	}
};

// Récupère un article publié par ID (public). Retourne Article avec content et imageUrl.
// GET /articles/published/id/:id
const readPublishedById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const article: Article | null =
			await articlesModel.findPublishedById(articleId);
		if (!article) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par ID :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère un article publié par slug (public). Retourne Article avec content et imageUrl.
// GET /articles/published/slug/:slug
const readPublishedBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const slug: string = req.params.slug;
		if (!slug) {
			res.status(400).json({ error: "Slug invalide" });
			return;
		}

		const article: Article | null =
			await articlesModel.findPublishedBySlug(slug);
		if (!article) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par slug :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère les 4 derniers articles publiés pour la preview homepage (imageUrl + tags).
// GET /articles/homepage-preview
const readHomepagePreview = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const articles: Article[] = await articlesModel.findHomepagePreview();
		res.status(200).json(articles);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de la preview homepage :",
			err,
		);
		res.sendStatus(500);
	}
};

export {
	browseAll,
	readById,
	readBySlug,
	browsePublished,
	readPublishedById,
	readPublishedBySlug,
	readHomepagePreview,
};
