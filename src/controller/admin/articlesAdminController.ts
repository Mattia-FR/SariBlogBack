/**
 * Controller admin des articles.
 * CRUD : liste, détail par ID ou par slug, création, mise à jour, suppression.
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 */
import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import type {
	Article,
	ArticleCreateData,
	ArticleStatus,
	ArticleUpdateData,
} from "../../types/articles";
import { excerptFromPlainText } from "../../utils/excerpt";
import { sendError } from "../../utils/httpErrors";
import logger from "../../utils/logger";
import { publishedAtForCreate } from "../../utils/publishedAt";
import { buildSlug } from "../../utils/slug";

const VALID_STATUSES: ArticleStatus[] = ["draft", "published", "archived"];

// Type pour un article admin : Article + comments_count (optionnel).
type ArticleWithCommentsCount = Article & { comments_count?: number };

// Liste paginée (tous statuts) avec tags. Query : page, limit (1–20), tagId optionnel.
// GET /admin/articles?page=1&limit=10&tagId=2
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
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

		const { articles, total } =
			await articlesAdminModel.findAllForAdminPaginated(page, limit, tagId);

		res.status(200).json({
			articles,
			total,
			page,
			limit,
		});
	} catch (err) {
		logger.error("Erreur lors de la récupération des articles (admin) :", err);
		sendError(res, 500, "Erreur lors de la récupération des articles");
	}
};

// Récupère un article par slug (tous statuts). Retourne Article avec content et imageUrl.
// GET /admin/articles/slug/:slug
const readBySlug = async (req: Request, res: Response): Promise<void> => {
	try {
		const slug: string = req.params.slug;
		if (!slug) {
			sendError(res, 400, "Slug invalide");
			return;
		}

		const article: Article | null =
			await articlesAdminModel.findBySlugForAdmin(slug);
		if (!article) {
			sendError(res, 404, "Article non trouvé");
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		logger.error("Erreur lors de la récupération de l'article par slug :", err);
		sendError(res, 500, "Erreur lors de la récupération de l'article par slug");
	}
};

// Récupère un article par ID avec content, imageUrl, tags et comments_count.
// GET /admin/articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const article: ArticleWithCommentsCount | null =
			await articlesAdminModel.findByIdForAdmin(articleId);
		if (!article) {
			sendError(res, 404, "Article non trouvé");
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de l'article par ID (admin) :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération de l'article");
	}
};

// Crée un nouvel article. user_id pris du JWT. Body : ArticleCreateData (sans user_id).
// POST /admin/articles
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			sendError(res, 401, "Non authentifié");
			return;
		}

		const title =
			typeof req.body.title === "string" ? req.body.title.trim() : "";
		if (!title) {
			sendError(res, 400, "Le titre est requis");
			return;
		}
		const slugProvided =
			req.body.slug && typeof req.body.slug === "string"
				? req.body.slug.trim()
				: "";
		let finalSlug: string;
		if (slugProvided) {
			finalSlug = buildSlug(slugProvided);
			if (!finalSlug) {
				sendError(res, 400, "Slug invalide");
				return;
			}
		} else {
			finalSlug = buildSlug(title);
		}
		const tagIds = Array.isArray(req.body.tag_ids)
			? req.body.tag_ids
					.map((id: unknown) => Number(id))
					.filter((id: number) => !Number.isNaN(id))
			: [];
		const rawStatus = req.body.status;
		const status: ArticleCreateData["status"] =
			typeof rawStatus === "string" &&
			VALID_STATUSES.includes(rawStatus as ArticleStatus)
				? (rawStatus as ArticleStatus)
				: "draft";
		const rawFeatured = req.body.featured_image_id;
		const featured_image_id: number | null =
			rawFeatured != null && rawFeatured !== ""
				? Number(rawFeatured) || null
				: null;
		const published_atRaw =
			req.body.published_at != null && req.body.published_at !== ""
				? String(req.body.published_at)
				: null;
		const published_at = publishedAtForCreate(status, published_atRaw);
		const content =
			typeof req.body.content === "string" ? req.body.content : "";
		const manualExcerpt =
			req.body.excerpt != null && req.body.excerpt !== ""
				? String(req.body.excerpt).trim()
				: null;
		const excerpt = manualExcerpt ?? excerptFromPlainText(content);
		const articleData: ArticleCreateData = {
			title,
			slug: finalSlug,
			content,
			excerpt,
			status,
			user_id: userId,
			featured_image_id,
			published_at,
			tag_ids: tagIds,
		};

		const newArticle: ArticleWithCommentsCount =
			await articlesAdminModel.create(articleData);
		res.status(201).json(newArticle);
	} catch (err) {
		logger.error("Erreur lors de la création de l'article (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Un article avec ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la création de l'article");
	}
};

// Met à jour un article. Body : ArticleUpdateData (champs partiels).
// PUT /admin/articles/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const existingArticle: Article | null =
			await articlesAdminModel.findByIdForAdmin(articleId);
		if (!existingArticle) {
			sendError(res, 404, "Article non trouvé");
			return;
		}

		const tagIds = Array.isArray(req.body.tag_ids)
			? req.body.tag_ids
					.map((id: unknown) => Number(id))
					.filter((id: number) => !Number.isNaN(id))
			: undefined;

		const articleData: ArticleUpdateData = {};

		if (typeof req.body.title === "string") {
			articleData.title = req.body.title.trim();
		}
		if (typeof req.body.slug === "string") {
			const trimmedSlug = req.body.slug.trim();
			if (trimmedSlug) {
				const sanitized = buildSlug(trimmedSlug);
				if (!sanitized) {
					sendError(res, 400, "Slug invalide");
					return;
				}
				articleData.slug = sanitized;
			}
		}
		if (typeof req.body.content === "string") {
			articleData.content = req.body.content;
		}

		const explicitExcerptNonEmpty =
			req.body.excerpt != null &&
			req.body.excerpt !== "" &&
			String(req.body.excerpt).trim() !== "";
		if (explicitExcerptNonEmpty) {
			articleData.excerpt = String(req.body.excerpt).trim();
		} else if (typeof req.body.content === "string") {
			articleData.excerpt = excerptFromPlainText(req.body.content);
		}

		const rawStatusEdit = req.body.status;
		if (
			typeof rawStatusEdit === "string" &&
			VALID_STATUSES.includes(rawStatusEdit as ArticleStatus)
		) {
			articleData.status = rawStatusEdit as ArticleStatus;
		}

		if (req.body.featured_image_id !== undefined) {
			const rawFeaturedEdit = req.body.featured_image_id;
			articleData.featured_image_id =
				rawFeaturedEdit != null && rawFeaturedEdit !== ""
					? Number(rawFeaturedEdit) || null
					: null;
		}

		if (req.body.published_at !== undefined) {
			articleData.published_at =
				req.body.published_at != null && req.body.published_at !== ""
					? String(req.body.published_at)
					: null;
		}

		articleData.tag_ids = tagIds;

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
			sendError(res, 404, "Article non trouvé");
			return;
		}

		res.status(200).json(updatedArticle);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour de l'article (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Un article avec ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la mise à jour de l'article");
	}
};

// Supprime un article par ID.
// DELETE /admin/articles/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const deleted: boolean = await articlesAdminModel.deleteOne(articleId);
		if (!deleted) {
			sendError(res, 404, "Article non trouvé");
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression de l'article (admin) :", err);
		sendError(res, 500, "Erreur lors de la suppression de l'article");
	}
};

export { browseAll, readBySlug, readById, add, edit, destroy };
