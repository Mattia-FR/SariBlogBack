import type { Request, Response } from "express";
import messagesModel from "../model/messagesModel";
import usersModel from "../model/usersModel";
import type { Message, MessageCreateData } from "../types/messages";

// Crée un nouveau message via le formulaire de contact (public ou utilisateur connecté)
// POST /messages
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		// Récupération de l'IP du client
		const ip = req.ip || req.socket.remoteAddress || null;

		let messageData: MessageCreateData;

		// Cas 1 : Utilisateur connecté (req.user est défini par optionalAuth)
		if (req.user?.userId) {
			// Récupérer les données de l'utilisateur depuis la base de données
			const user = await usersModel.findById(req.user.userId);

			if (!user) {
				res.status(404).json({ error: "Utilisateur non trouvé" });
				return;
			}

			const { subject, text } = req.body;

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

export { add };
