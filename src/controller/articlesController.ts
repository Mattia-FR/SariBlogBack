/**
 * Controller des articles (API publique).
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 */
import type { Request, Response } from "express";
import articlesModel from "../model/articlesModel";
import type { Article } from "../types/articles";
import { HttpError } from "../utils/httpErrors";
import {
	assertPageInRange,
	parseIdParam,
	parseOptionalIdQuery,
	parsePaginationParams,
} from "../utils/requestParams";

// Liste les articles publiés (public), paginée. Query : page, limit (1–20), tagId optionnel.
// GET /articles/published?page=1&limit=10&tagId=2
const browsePublished = async (req: Request, res: Response): Promise<void> => {
	const { page, limit } = parsePaginationParams(req.query);
	const tagId = parseOptionalIdQuery(req.query.tagId, "tagId");

	const { articles, total } = await articlesModel.findPublished(
		page,
		limit,
		tagId,
	);
	assertPageInRange(page, limit, total);
	res.status(200).json({ articles, total, page, limit });
};

// Récupère un article publié par ID (public). Retourne Article avec content et imageUrl.
// GET /articles/published/id/:id
const readPublishedById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const articleId = parseIdParam(req.params.id);
	const article: Article | null =
		await articlesModel.findPublishedById(articleId);
	if (!article) {
		throw new HttpError(404, "Article publié non trouvé");
	}
	res.status(200).json(article);
};

// Récupère un article publié par slug (public). Retourne Article avec content et imageUrl.
// GET /articles/published/slug/:slug
const readPublishedBySlug = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const slug: string = req.params.slug;
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}
	const article: Article | null = await articlesModel.findPublishedBySlug(slug);
	if (!article) {
		throw new HttpError(404, "Article publié non trouvé");
	}
	res.status(200).json(article);
};

// Récupère les 4 derniers articles publiés pour la preview homepage (imageUrl + tags).
// GET /articles/homepage-preview
const readHomepagePreview = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const articles: Article[] = await articlesModel.findHomepagePreview();
	res.status(200).json(articles);
};

export {
	browsePublished,
	readPublishedById,
	readPublishedBySlug,
	readHomepagePreview,
};
