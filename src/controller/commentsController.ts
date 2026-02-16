import type { Request, Response } from "express";
import commentsModel from "../model/commentsModel";
import type { Comment } from "../types/comments";

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
		console.error(
			"Erreur lors de la récupération des commentaires approuvés par ID d'article :",
			err,
		);
		res.sendStatus(500);
	}
};

// Crée un commentaire (utilisateur connecté). Statut initial : pending.
// POST /comments
const create = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user?.userId) {
			res.sendStatus(401);
			return;
		}
		const articleId = Number.parseInt(req.body.article_id, 10);
		const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
		if (Number.isNaN(articleId) || !text) {
			res.status(400).json({
				error:
					"Données invalides : article_id (nombre) et text (non vide) requis",
			});
			return;
		}
		const created = await commentsModel.create({
			text,
			user_id: req.user.userId,
			article_id: articleId,
		});
		res.status(201).json(created);
	} catch (err) {
		console.error("Erreur lors de la création du commentaire :", err);
		res.sendStatus(500);
	}
};

export { readByArticleId, create };
