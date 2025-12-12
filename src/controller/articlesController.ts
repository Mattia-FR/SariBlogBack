import type { Request, Response } from "express";

import articlesModel from "../model/articlesModel";

import type { Article, ArticleListItem } from "../types/articles";

// Liste tous les articles (admin - tous statuts)
// GET /articles
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: ArticleListItem[] = await articlesModel.findAll();
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les articles:", err);
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
		console.error("Erreur lors de la récupération de l'article par ID:", err);
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
		console.error("Erreur lors de la récupération de l'article par slug:", err);
		res.sendStatus(500);
	}
};

// Liste tous les articles publiés (public)
// GET /articles/published
const browsePublished = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: ArticleListItem[] = await articlesModel.findPublished();
		res.status(200).json(articles);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés:", err);
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
		console.error("Erreur lors de la récupération de l'article publié par slug:", err);
		res.sendStatus(500);
	}
};

export {
	browseAll,
	readById,
	readBySlug,
	browsePublished,
	readPublishedBySlug,
};
