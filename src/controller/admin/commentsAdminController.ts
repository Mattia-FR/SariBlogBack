import type { Request, Response } from "express";
import commentsAdminModel from "../../model/admin/commentsAdminModel";
import type { Comment, CommentStatus } from "../../types/comments";

// Liste tous les commentaires
// GET /comments
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const comments: Comment[] = await commentsAdminModel.findAll();
		res.status(200).json(comments);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de tous les commentaires :",
			err,
		);
		res.sendStatus(500);
	}
};

// Liste les commentaires par statut
// GET /comments/status/:status
const browseByStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const { status } = req.params;
		if (!["pending", "approved", "rejected", "spam"].includes(status)) {
			res.status(400).json({ error: "Statut invalide" });
			return;
		}
		const comments: Comment[] = await commentsAdminModel.findByStatus(
			status as CommentStatus,
		);
		res.status(200).json(comments);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des commentaires par statut :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère un commentaire par ID
// GET /comments/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(commentId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const comment: Comment | null =
			await commentsAdminModel.findById(commentId);
		if (!comment) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(comment);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération du commentaire par ID :",
			err,
		);
		res.sendStatus(500);
	}
};

// Met à jour le statut d'un commentaire
// PATCH /comments/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		const { status } = req.body;
		if (Number.isNaN(commentId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		if (!["pending", "approved", "rejected", "spam"].includes(status)) {
			res.status(400).json({ error: "Statut invalide" });
			return;
		}
		const updatedComment: Comment | null =
			await commentsAdminModel.updateStatus(commentId, { status });
		if (!updatedComment) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(updatedComment);
	} catch (err) {
		console.error("Erreur lors de la mise à jour du statut :", err);
		res.sendStatus(500);
	}
};

// Supprime un commentaire
// DELETE /comments/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const commentId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(commentId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const deleted: boolean = await commentsAdminModel.deleteOne(commentId);
		if (!deleted) {
			res.sendStatus(404);
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		console.error("Erreur lors de la suppression du commentaire :", err);
		res.sendStatus(500);
	}
};

export { browseAll, browseByStatus, readById, editStatus, destroy };
