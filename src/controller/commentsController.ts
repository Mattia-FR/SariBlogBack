import type { Request, Response } from "express";
import commentsModel from "../model/commentsModel";
import type { Comment } from "../types/comments";
import { HttpError } from "../utils/httpErrors";
import { isMissingReference } from "../utils/mysqlErrors";
import { parseIdParam } from "../utils/requestParams";

// Récupère tous les commentaires approuvés associés à un article par son ID (public)
// GET /comments/article/:articleId
const readByArticleId = async (req: Request, res: Response): Promise<void> => {
	const articleId = parseIdParam(req.params.articleId);
	const comments: Comment[] =
		await commentsModel.findApprovedByArticleId(articleId);
	res.status(200).json(comments);
};

// Crée un commentaire (visiteur anonyme). Statut initial : pending, modération via admin.
// POST /comments
const create = async (req: Request, res: Response): Promise<void> => {
	const { article_id: articleId, text, firstname, lastname, email } = req.body;
	const created = await commentsModel
		.create({
			text,
			article_id: articleId,
			user_id: null,
			firstname: firstname?.trim() ?? null,
			lastname: lastname?.trim() ?? null,
			email: email?.trim() ?? null,
		})
		.catch((err: unknown) => {
			if (isMissingReference(err)) {
				throw new HttpError(404, "Article introuvable");
			}
			throw err;
		});
	res.status(201).json(created);
};

export { readByArticleId, create };
