/**
 * Controller admin des articles.
 * CRUD : liste, détail, création, mise à jour, suppression.
 * Les articles renvoyés par le model sont déjà au format Article (dates string, imageUrl).
 */
import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import type {
	Article,
	ArticleCreateData,
	ArticleUpdateData,
	ArticleStatus,
} from "../../types/articles";
import { buildSlug } from "../../utils/slug";
import logger from "../../utils/logger";

const VALID_STATUSES: ArticleStatus[] = ["draft", "published", "archived"];

// Type pour un article admin : Article + comments_count (optionnel).
type ArticleWithCommentsCount = Article & { comments_count?: number };

// Liste tous les articles (tous statuts) avec tags et comments_count.
// GET /admin/articles
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: ArticleWithCommentsCount[] =
			await articlesAdminModel.findAllForAdmin();
		res.status(200).json(articles);
	} catch (err) {
		logger.error("Erreur lors de la récupération des articles (admin) :", err);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération des articles" });
	}
};

// Récupère un article par ID avec content, imageUrl, tags et comments_count.
// GET /admin/articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const article: ArticleWithCommentsCount | null =
			await articlesAdminModel.findByIdForAdmin(articleId);
		if (!article) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}

		res.status(200).json(article);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de l'article par ID (admin) :",
			err,
		);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération de l'article" });
	}
};

// Crée un nouvel article. user_id pris du JWT. Body : ArticleCreateData (sans user_id).
// POST /admin/articles
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({ error: "Non authentifié" });
			return;
		}

		const title =
			typeof req.body.title === "string" ? req.body.title.trim() : "";
		if (!title) {
			res.status(400).json({ error: "Le titre est requis" });
			return;
		}
		const slugProvided =
			req.body.slug && typeof req.body.slug === "string"
				? req.body.slug.trim()
				: "";
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
		const published_at =
			req.body.published_at != null && req.body.published_at !== ""
				? String(req.body.published_at)
				: null;
		const articleData: ArticleCreateData = {
			title,
			slug: slugProvided || buildSlug(title),
			content: typeof req.body.content === "string" ? req.body.content : "",
			excerpt:
				req.body.excerpt != null && req.body.excerpt !== ""
					? String(req.body.excerpt).trim()
					: null,
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
			res.status(409).json({ error: "Un article avec ce slug existe déjà" });
			return;
		}

		res.status(500).json({ error: "Erreur lors de la création de l'article" });
	}
};

// Met à jour un article. Body : ArticleUpdateData (champs partiels).
// PUT /admin/articles/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const tagIds = Array.isArray(req.body.tag_ids)
			? req.body.tag_ids
					.map((id: unknown) => Number(id))
					.filter((id: number) => !Number.isNaN(id))
			: undefined;
		const articleData: ArticleUpdateData = {
			...req.body,
			tag_ids: tagIds,
		};
		const updatedArticle: ArticleWithCommentsCount | null =
			await articlesAdminModel.update(articleId, articleData);

		if (!updatedArticle) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}

		res.status(200).json(updatedArticle);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour de l'article (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			res.status(409).json({ error: "Un article avec ce slug existe déjà" });
			return;
		}

		res
			.status(500)
			.json({ error: "Erreur lors de la mise à jour de l'article" });
	}
};

// Supprime un article par ID.
// DELETE /admin/articles/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const deleted: boolean = await articlesAdminModel.deleteOne(articleId);
		if (!deleted) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression de l'article (admin) :", err);
		res
			.status(500)
			.json({ error: "Erreur lors de la suppression de l'article" });
	}
};

export { browseAll, readById, add, edit, destroy };
