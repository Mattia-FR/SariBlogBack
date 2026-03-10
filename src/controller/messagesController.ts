import type { Request, Response } from "express";
import messagesModel from "../model/messagesModel";
import type { Message, MessageCreateData } from "../types/messages";

// Crée un nouveau message via le formulaire de contact (visiteur uniquement)
// POST /messages
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const ip = req.ip || req.socket.remoteAddress || null;
		const { firstname, lastname, email, subject, text } = req.body;

		const messageData: MessageCreateData = {
			firstname,
			lastname,
			email,
			subject,
			text,
			ip,
			user_id: null,
		};

		const newMessage: Message = await messagesModel.create(messageData);
		res.status(201).json(newMessage);
	} catch (err) {
		console.error("Erreur lors de la création du message :", err);
		res.sendStatus(500);
	}
};

export { add };
