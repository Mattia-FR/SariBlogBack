import type { Request, Response } from "express";
import messagesModel from "../model/messagesModel";
import type { Message, MessageCreateData } from "../types/messages";
import { sendError } from "../utils/httpErrors";
import logger from "../utils/logger";

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
		logger.error("Erreur lors de la création du message :", err);
		sendError(res, 500, "Erreur lors de la création du message");
	}
};

export { add };
