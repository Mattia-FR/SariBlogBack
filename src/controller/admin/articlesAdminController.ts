/**
 * Controller admin des articles.
 * CRUD : liste, détail par ID ou par slug, création, mise à jour, suppression.
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 * Les erreurs sont levées (HttpError) et traduites par errorHandler.
 */
import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import type {
	Article,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";
import { excerptFromPlainText } from "../../utils/excerpt";
import { HttpError } from "../../utils/httpErrors";
import { publishedAtForCreate } from "../../utils/publishedAt";
import {
	assertPageInRange,
	parseIdParam,
	parseOptionalIdQuery,
	parsePaginationParams,
} from "../../utils/requestParams";
import { buildSlug } from "../../utils/slug";

// Type pour un article admin : Article + comments_count (optionnel).
type ArticleWithCommentsCount = Article & { comments_count?: number };

function sanitizeSlug(raw: string): string {
	const slug = buildSlug(raw);
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}
	return slug;
}

// Liste paginée (tous statuts) avec tags. Query : page, limit (1–20), tagId optionnel.
// GET /admin/articles?page=1&limit=10&tagId=2
const browseAll = async (req: Request, res: Response): Promise<void> => {
	const { page, limit } = parsePaginationParams(req.query);
	const tagId = parseOptionalIdQuery(req.query.tagId, "tagId");

	const { articles, total } = await articlesAdminModel.findAllForAdminPaginated(
		page,
		limit,
		tagId,
	);
	assertPageInRange(page, limit, total);

	res.status(200).json({ articles, total, page, limit });
};

// Récupère un article par slug (tous statuts). Retourne Article avec content et imageUrl.
// GET /admin/articles/slug/:slug
const readBySlug = async (req: Request, res: Response): Promise<void> => {
	const slug: string = req.params.slug;
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}

	const article: Article | null =
		await articlesAdminModel.findBySlugForAdmin(slug);
	if (!article) {
		throw new HttpError(404, "Article non trouvé");
	}

	res.status(200).json(article);
};

// Récupère un article par ID avec content, imageUrl, tags et comments_count.
// GET /admin/articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.id);

	const article: ArticleWithCommentsCount | null =
		await articlesAdminModel.findByIdForAdmin(articleId);
	if (!article) {
		throw new HttpError(404, "Article non trouvé");
	}

	res.status(200).json(article);
};

// Crée un nouvel article. user_id pris du JWT. Body : ArticleCreateData (sans user_id).
// POST /admin/articles
const add = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user?.userId;
	if (!userId) {
		throw new HttpError(401, "Non authentifié");
	}

	const {
		title,
		slug: slugProvided,
		content,
		excerpt: excerptRaw,
		status: statusRaw,
		featured_image_id,
		published_at: publishedAtRaw,
		tag_ids,
	} = req.body;

	const finalSlug = slugProvided
		? sanitizeSlug(slugProvided)
		: buildSlug(title);
	const status = statusRaw ?? "draft";
	const published_at = publishedAtForCreate(
		status,
		publishedAtRaw != null && publishedAtRaw !== "" ? publishedAtRaw : null,
	);
	const manualExcerpt =
		excerptRaw != null && excerptRaw !== "" ? excerptRaw.trim() : null;
	const excerpt = manualExcerpt ?? excerptFromPlainText(content);

	const articleData: ArticleCreateData = {
		title,
		slug: finalSlug,
		content,
		excerpt,
		status,
		user_id: userId,
		featured_image_id: featured_image_id ?? null,
		published_at,
		tag_ids: tag_ids ?? [],
	};

	const newArticle: ArticleWithCommentsCount =
		await articlesAdminModel.create(articleData);
	res.status(201).json(newArticle);
};

// Met à jour un article. Body : ArticleUpdateData (champs partiels).
// PATCH /admin/articles/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.id);

	const existingArticle: Article | null =
		await articlesAdminModel.findByIdForAdmin(articleId);
	if (!existingArticle) {
		throw new HttpError(404, "Article non trouvé");
	}

	const articleData: ArticleUpdateData = {};
	const {
		title,
		slug,
		content,
		excerpt: excerptRaw,
		status,
		featured_image_id,
		published_at,
		tag_ids,
	} = req.body;

	if (title !== undefined) {
		articleData.title = title;
	}
	if (slug !== undefined && slug !== "") {
		articleData.slug = sanitizeSlug(slug);
	}
	if (content !== undefined) {
		articleData.content = content;
	}

	const explicitExcerptNonEmpty =
		excerptRaw != null && excerptRaw !== "" && excerptRaw.trim() !== "";
	if (explicitExcerptNonEmpty) {
		articleData.excerpt = excerptRaw.trim();
	} else if (content !== undefined) {
		articleData.excerpt = excerptFromPlainText(content);
	}

	if (status !== undefined) {
		articleData.status = status;
	}
	if (featured_image_id !== undefined) {
		articleData.featured_image_id = featured_image_id;
	}
	if (published_at !== undefined) {
		articleData.published_at =
			published_at != null && published_at !== "" ? published_at : null;
	}
	if (tag_ids !== undefined) {
		articleData.tag_ids = tag_ids;
	}

	const mergedStatus = articleData.status ?? existingArticle.status;
	const mergedPublishedAt =
		"published_at" in articleData
			? articleData.published_at
			: existingArticle.published_at;
	if (
		mergedStatus === "published" &&
		(mergedPublishedAt == null || mergedPublishedAt === "")
	) {
		articleData.published_at = new Date().toISOString();
	}

	const updatedArticle: ArticleWithCommentsCount | null =
		await articlesAdminModel.update(articleId, articleData);

	if (!updatedArticle) {
		throw new HttpError(404, "Article non trouvé");
	}

	res.status(200).json(updatedArticle);
};

// Supprime un article par ID.
// DELETE /admin/articles/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.id);
	const deleted: boolean = await articlesAdminModel.deleteOne(articleId);
	if (!deleted) {
		throw new HttpError(404, "Article non trouvé");
	}
	res.sendStatus(204);
};

export { browseAll, readBySlug, readById, add, edit, destroy };
