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

export { readByArticleId };
