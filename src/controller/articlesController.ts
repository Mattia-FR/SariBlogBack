/**
 * Controller des articles (API publique).
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 */
import type { Request, Response } from "express";
import articlesModel from "../model/articlesModel";
import type { Article } from "../types/articles";
import { sendError } from "../utils/httpErrors";
import logger from "../utils/logger";

// Liste les articles publiés (public). Option limit (max 20). Retourne Article[] avec imageUrl et tags.
// GET /articles/published?limit=4
const browsePublished = async (req: Request, res: Response): Promise<void> => {
	try {
		const page = Number.parseInt(req.query.page as string, 10) || 1;
		const limit = Number.parseInt(req.query.limit as string, 10) || 10;

		if (page < 1) {
			sendError(res, 400, "Le paramètre page doit être un nombre positif");
			return;
		}
		// Pour éviter que quelqu'un envoie "?page=-5" (qui serait truthy) et que la requête soit exécutée :
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

		const { articles, total } = await articlesModel.findPublished(
			page,
			limit,
			tagId,
		);
		res.status(200).json({ articles, total, page, limit });
	} catch (err) {
		logger.error("Erreur lors de la récupération des articles publiés :", err);
		sendError(res, 500, "Erreur lors de la récupération des articles publiés");
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
			sendError(res, 400, "ID invalide");
			return;
		}

		const article: Article | null =
			await articlesModel.findPublishedById(articleId);
		if (!article) {
			sendError(res, 404, "Article publié non trouvé");
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de l'article publié par ID :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération de l'article publié par ID",
		);
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
			sendError(res, 400, "Slug invalide");
			return;
		}

		const article: Article | null =
			await articlesModel.findPublishedBySlug(slug);
		if (!article) {
			sendError(res, 404, "Article publié non trouvé");
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de l'article publié par slug :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération de l'article publié par slug",
		);
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
		logger.error(
			"Erreur lors de la récupération de la preview homepage :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération de la preview homepage",
		);
	}
};

export {
	browsePublished,
	readPublishedById,
	readPublishedBySlug,
	readHomepagePreview,
};
