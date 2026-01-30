import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import type {
	ArticleAdmin,
	ArticleForAdmin,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";

// Configuration de l'URL de base pour les images
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

/**
 * Fonction utilitaire pour enrichir un article avec l'URL complète de son image
 * (Réutilisée du controller public)
 */
function enrichArticleWithImageUrl<T extends { image_path?: string | null }>(
	article: T,
): Omit<T, "image_path"> & { imageUrl?: string } {
	if (article.image_path) {
		const { image_path, ...rest } = article;
		return {
			...rest,
			imageUrl: `${IMAGE_BASE_URL}${image_path}`,
		};
	}
	const { image_path, ...rest } = article;
	return rest;
}

/**
 * Liste TOUS les articles (tous statuts) - Admin
 * GET /admin/articles
 */
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const articles: ArticleForAdmin[] =
			await articlesAdminModel.findAllForAdmin();

		// Enrichir les articles avec l'URL complète
		const enrichedArticles = articles.map(enrichArticleWithImageUrl);

		res.status(200).json(enrichedArticles);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles (admin) :", err);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération des articles" });
	}
};

/**
 * Récupère un article par ID avec toutes les infos - Admin
 * GET /admin/articles/:id
 */
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const article: ArticleAdmin | null =
			await articlesAdminModel.findByIdForAdmin(articleId);
		if (!article) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}

		// Enrichir avec l'URL complète de l'image featured
		const enrichedArticle = enrichArticleWithImageUrl(article);
		res.status(200).json(enrichedArticle);
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

const add = async (req: Request, res: Response): Promise<void> => {
	try {
		// 1. Récupérer l'ID de l'utilisateur authentifié
		const userId = req.user?.userId;
		if (!userId) {
			res.status(401).json({ error: "Non authentifié" });
			return;
		}

		// 2. Écraser l'user_id du body par celui du JWT
		const articleData: ArticleCreateData = {
			...req.body,
			user_id: userId,
		};

		const newArticle: ArticleAdmin =
			await articlesAdminModel.create(articleData);
		const enrichedArticle = enrichArticleWithImageUrl(newArticle);
		res.status(201).json(enrichedArticle);
	} catch (err) {
		console.error("Erreur lors de la création de l'article (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			res.status(409).json({ error: "Un article avec ce slug existe déjà" });
			return;
		}

		res.status(500).json({ error: "Erreur lors de la création de l'article" });
	}
};

const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const articleData: ArticleUpdateData = req.body;
		const updatedArticle: ArticleAdmin | null = await articlesAdminModel.update(
			articleId,
			articleData,
		);

		if (!updatedArticle) {
			res.status(404).json({ error: "Article non trouvé" });
			return;
		}

		const enrichedArticle = enrichArticleWithImageUrl(updatedArticle);
		res.status(200).json(enrichedArticle);
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
