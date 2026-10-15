import type { Request, Response } from "express";
import messagesModel from "../model/messagesModel";
import type { Message, MessageCreateData } from "../types/messages";

// Crée un nouveau message via le formulaire de contact (visiteur uniquement)
// POST /messages
const add = async (req: Request, res: Response): Promise<void> => {
	const ip = req.ip || req.socket.remoteAddress || null;
	const { firstname, lastname, email, subject, text } = req.body;

	const messageData: MessageCreateData = {
		firstname,
		lastname,
		email,
		subject,
		text,
		ip,
	};

	const newMessage: Message = await messagesModel.create(messageData);
	res.status(201).json(newMessage);
};

export { add };
