import type { Request, Response } from "express";
import messagesModel from "../model/messagesModel";
import usersModel from "../model/usersModel";
import type { Message, MessageCreateData } from "../types/messages";

// Liste tous les messages (admin uniquement)
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

// Liste les messages par statut (admin uniquement)
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

// Récupère un message par ID (admin uniquement)
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

// Crée un nouveau message via le formulaire de contact (public ou utilisateur connecté)
// POST /messages
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		// Récupération de l'IP du client
		const ip = req.ip || req.socket.remoteAddress || null;

		let messageData: MessageCreateData;

		// Cas 1 : Utilisateur connecté (req.user est défini par optionalAuth)
		if (req.user && req.user.userId) {
			// Récupérer les données de l'utilisateur depuis la base de données
			const user = await usersModel.findById(req.user.userId);

			if (!user) {
				res.status(404).json({ error: "Utilisateur non trouvé" });
				return;
			}

			// Validation des champs requis pour utilisateur connecté
			const { subject, text } = req.body;
			if (!subject || !text) {
				res.status(400).json({ error: "Le sujet et le message sont requis" });
				return;
			}

			// Utiliser les données de l'utilisateur connecté
			messageData = {
				username: user.username,
				email: user.email,
				firstname: user.firstname,
				lastname: user.lastname,
				subject,
				text,
				ip,
				user_id: user.id,
			};
		} else {
			// Cas 2 : Visiteur non connecté (formulaire classique)
			const { firstname, lastname, email, subject, text } = req.body;

			// Validation basique pour visiteur
			if (!firstname || !lastname || !email || !subject || !text) {
				res.status(400).json({ error: "Tous les champs sont requis" });
				return;
			}

			messageData = {
				firstname,
				lastname,
				email,
				subject,
				text,
				ip,
				user_id: null,
			};
		}

		const newMessage: Message = await messagesModel.create(messageData);
		res.status(201).json(newMessage);
	} catch (err) {
		console.error("Erreur lors de la création du message :", err);
		res.sendStatus(500);
	}
};

// Met à jour le statut d'un message (admin uniquement)
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
			status,
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

// Supprime un message (admin uniquement)
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

export { browseAll, browseByStatus, readById, add, editStatus, destroy };
