import type { Request, Response } from "express";
import messagesModel from "../../model/messagesModel";
import type { Message } from "../../types/messages";

// Liste tous les messages
// GET /messages
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const messages: Message[] = await messagesModel.findAll();
		res.status(200).json(messages);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les messages :", err);
		res.sendStatus(500);
	}
};

// Liste les messages par statut
// GET /messages/status/:status
const browseByStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const { status } = req.params;
		if (!["unread", "read", "archived"].includes(status)) {
			res.status(400).json({ error: "Statut invalide" });
			return;
		}
		const messages: Message[] = await messagesModel.findByStatus(
			status as "unread" | "read" | "archived",
		);
		res.status(200).json(messages);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des messages par statut :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère un message par ID
// GET /messages/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(messageId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const message: Message | null = await messagesModel.findById(messageId);
		if (!message) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(message);
	} catch (err) {
		console.error("Erreur lors de la récupération du message par ID :", err);
		res.sendStatus(500);
	}
};

// Met à jour le statut d'un message
// PATCH /messages/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		const { status } = req.body;
		if (Number.isNaN(messageId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		if (!["unread", "read", "archived"].includes(status)) {
			res.status(400).json({ error: "Statut invalide" });
			return;
		}
		const updatedMessage: Message | null = await messagesModel.updateStatus(
			messageId,
			{ status },
		);
		if (!updatedMessage) {
			res.sendStatus(404);
			return;
		}
		res.status(200).json(updatedMessage);
	} catch (err) {
		console.error("Erreur lors de la mise à jour du statut :", err);
		res.sendStatus(500);
	}
};

// Supprime un message
// DELETE /messages/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(messageId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}
		const deleted: boolean = await messagesModel.deleteOne(messageId);
		if (!deleted) {
			res.sendStatus(404);
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		console.error("Erreur lors de la suppression du message :", err);
		res.sendStatus(500);
	}
};

export { browseAll, browseByStatus, readById, editStatus, destroy };
