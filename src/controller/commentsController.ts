import type { Request, Response } from "express";
import commentsModel from "../model/commentsModel";
import type { Comment } from "../types/comments";
import logger from "../utils/logger";

// Récupère tous les commentaires approuvés associés à un article par son ID (public)
// GET /comments/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	try {
		const articleId: number = Number.parseInt(req.params.articleId, 10);
		if (Number.isNaN(articleId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const comments: Comment[] =
			await commentsModel.findApprovedByArticleId(articleId);
		res.status(200).json(comments);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des commentaires approuvés par ID d'article :",
			err,
		);
		res.sendStatus(500);
	}
};

// Crée un commentaire (visiteur anonyme). Statut initial : pending, modération via admin.
// POST /comments
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const {
			article_id: articleId,
			text,
			firstname,
			lastname,
			email,
		} = req.body;
		const created = await commentsModel.create({
			text,
			article_id: articleId,
			user_id: null,
			firstname: firstname?.trim() ?? null,
			lastname: lastname?.trim() ?? null,
			email: email?.trim() ?? null,
		});
		res.status(201).json(created);
	} catch (err) {
		logger.error("Erreur lors de la création du commentaire :", err);
		res.sendStatus(500);
	}
};

export { readByArticleId, create };
