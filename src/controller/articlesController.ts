import type { Request, Response } from "express";

import articlesModel from "../model/articlesModel";

import type { Article, ArticleListItem, ArticleForList } from "../types/articles";

// Liste tous les articles (admin - tous statuts)
// GET /articles
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: ArticleListItem[] = await articlesModel.findAll();
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les articles :", err);
		res.sendStatus(500);
	}
};

// Récupère un article par ID (admin - tous statuts)
// GET /articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const article: Article | null = await articlesModel.findById(articleId);
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

// Récupère un article par slug (admin - tous statuts)
// GET /articles/slug/:slug
const readBySlug = async (req: Request, res: Response): Promise<void> => {
	try {
		const slug: string = req.params.slug;
		if (!slug) {
			res.status(400).json({ error: "Slug invalide" });
			return;
		}

		const article: Article | null = await articlesModel.findBySlug(slug);
		if (!article) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'article par slug :", err);
		res.sendStatus(500);
	}
};

// Liste tous les articles publiés (public)
// GET /articles/published?limit=4 (optionnel, max 20)
const browsePublished = async (req: Request, res: Response): Promise<void> => {
	try {
		// Récupérer le paramètre limit depuis la query string (optionnel)
		const limitParam = req.query.limit;
		const limit = limitParam
			? Number.parseInt(limitParam as string, 10)
			: undefined;

		// Valider que limit est un nombre positif si fourni
		if (limit !== undefined) {
			if (Number.isNaN(limit) || limit < 1) {
				res.status(400).json({ error: "Le paramètre limit doit être un nombre positif" });
				return;
			}
			if (limit > 20) {
				res.status(400).json({ error: "Le paramètre limit ne peut pas dépasser 20" });
				return;
			}
		}

		const articles: ArticleListItem[] = await articlesModel.findPublished(limit);
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés :", err);
		res.sendStatus(500);
	}
};

// Récupère un article publié par slug (public)
// GET /articles/published/:slug
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
		console.error("Erreur lors de la récupération de l'article publié par slug :", err);
		res.sendStatus(500);
	}
};

/**
 * Récupère les 4 derniers articles pour la preview homepage
 * GET /articles/homepage-preview
 *
 * Endpoint optimisé qui retourne directement les articles enrichis
 * avec leurs images et tags en une seule requête.
 */
const readHomepagePreview = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const articles: ArticleForList[] =
			await articlesModel.findHomepagePreview();
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
	readPublishedBySlug,
	readHomepagePreview,
};
