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
} from "../../types/articles";
import { buildSlug } from "../../utils/slug";

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
		console.error("Erreur lors de la récupération des articles (admin) :", err);
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
		console.error(
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
		const articleData: ArticleCreateData = {
			...req.body,
			title,
			slug: slugProvided || buildSlug(title),
			user_id: userId,
		};

		const newArticle: ArticleWithCommentsCount =
			await articlesAdminModel.create(articleData);
		res.status(201).json(newArticle);
	} catch (err) {
		console.error("Erreur lors de la création de l'article (admin) :", err);

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
		const articleData: ArticleUpdateData = req.body;
		const updatedArticle: ArticleWithCommentsCount | null =
			await articlesAdminModel.update(articleId, articleData);

		if (!updatedArticle) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}

		res.status(200).json(updatedArticle);
	} catch (err) {
		console.error("Erreur lors de la mise à jour de l'article (admin) :", err);

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
		console.error("Erreur lors de la suppression de l'article (admin) :", err);
		res
			.status(500)
			.json({ error: "Erreur lors de la suppression de l'article" });
	}
};

export { browseAll, readById, add, edit, destroy };
