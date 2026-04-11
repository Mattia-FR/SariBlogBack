import type { Request, Response } from "express";
import commentsAdminModel from "../../model/admin/commentsAdminModel";
import type { Comment, CommentStatus } from "../../types/comments";
import { sendError } from "../../utils/httpErrors";
import logger from "../../utils/logger";

// Liste paginée des commentaires. Query : page, limit (1–20), status optionnel (pending | approved | rejected | spam).
// GET /admin/comments?page=1&limit=10&status=pending
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

		let status: CommentStatus | undefined;
		const statusRaw = req.query.status;
		if (statusRaw !== undefined && statusRaw !== "") {
			const s = String(statusRaw);
			if (!["pending", "approved", "rejected", "spam"].includes(s)) {
				sendError(res, 400, "Statut de filtre invalide");
				return;
			}
			status = s as CommentStatus;
		}

		const [{ comments, total }, counts] = await Promise.all([
			commentsAdminModel.findAllPaginated(page, limit, status),
			commentsAdminModel.findTabCounts(),
		]);

		res.status(200).json({
			comments,
			total,
			page,
			limit,
			counts,
		});
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de tous les commentaires :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération des commentaires");
	}
};

// Liste les commentaires par statut
// GET /comments/status/:status
const browseByStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const { status } = req.params;
		if (!["pending", "approved", "rejected", "spam"].includes(status)) {
			sendError(res, 400, "Statut invalide");
			return;
		}
		const comments: Comment[] = await commentsAdminModel.findByStatus(
			status as CommentStatus,
		);
		res.status(200).json(comments);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération des commentaires par statut :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération des commentaires par statut");
	}
};

// Récupère un commentaire par ID
// GET /comments/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(commentId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const comment: Comment | null =
			await commentsAdminModel.findById(commentId);
		if (!comment) {
			sendError(res, 404, "Commentaire non trouvé");
			return;
		}
		res.status(200).json(comment);
	} catch (err) {
		logger.error("Erreur lors de la récupération du commentaire par ID :", err);
		sendError(res, 500, "Erreur lors de la récupération du commentaire");
	}
};

// Met à jour le statut d'un commentaire
// PATCH /comments/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		const { status } = req.body;
		if (Number.isNaN(commentId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		if (!["pending", "approved", "rejected", "spam"].includes(status)) {
			sendError(res, 400, "Statut invalide");
			return;
		}
		const updatedComment: Comment | null =
			await commentsAdminModel.updateStatus(commentId, { status });
		if (!updatedComment) {
			sendError(res, 404, "Commentaire non trouvé");
			return;
		}
		res.status(200).json(updatedComment);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour du statut :", err);
		sendError(res, 500, "Erreur lors de la mise à jour du statut du commentaire");
	}
};

// Supprime un commentaire
// DELETE /comments/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(commentId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const deleted: boolean = await commentsAdminModel.deleteOne(commentId);
		if (!deleted) {
			sendError(res, 404, "Commentaire non trouvé");
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression du commentaire :", err);
		sendError(res, 500, "Erreur lors de la suppression du commentaire");
	}
};

export { browseAll, browseByStatus, readById, editStatus, destroy };
