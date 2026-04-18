import type { Request, Response } from "express";
import messagesAdminModel from "../../model/admin/messagesAdminModel";
import type { Message, MessageStatus } from "../../types/messages";
import { sendError } from "../../utils/httpErrors";
import logger from "../../utils/logger";

// Liste paginée des messages. Query : page, limit (1–20), status optionnel (unread | read | archived).
// GET /admin/messages?page=1&limit=10&status=unread
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

		let status: MessageStatus | undefined;
		const statusRaw = req.query.status;
		if (statusRaw !== undefined && statusRaw !== "") {
			const s = String(statusRaw);
			if (!["unread", "read", "archived"].includes(s)) {
				sendError(res, 400, "Statut de filtre invalide");
				return;
			}
			status = s as MessageStatus;
		}

		const [{ messages, total }, counts] = await Promise.all([
			messagesAdminModel.findAllPaginated(page, limit, status),
			messagesAdminModel.findTabCounts(),
		]);

		res.status(200).json({
			messages,
			total,
			page,
			limit,
			counts,
		});
	} catch (err) {
		logger.error("Erreur lors de la récupération de tous les messages :", err);
		sendError(res, 500, "Erreur lors de la récupération des messages");
	}
};

// Récupère un message par ID
// GET /messages/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(messageId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const message: Message | null =
			await messagesAdminModel.findById(messageId);
		if (!message) {
			sendError(res, 404, "Message non trouvé");
			return;
		}
		res.status(200).json(message);
	} catch (err) {
		logger.error("Erreur lors de la récupération du message par ID :", err);
		sendError(res, 500, "Erreur lors de la récupération du message");
	}
};

// Met à jour le statut d'un message
// PATCH /messages/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		const { status } = req.body;
		if (Number.isNaN(messageId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		if (!["unread", "read", "archived"].includes(status)) {
			sendError(res, 400, "Statut invalide");
			return;
		}
		const updatedMessage: Message | null =
			await messagesAdminModel.updateStatus(messageId, { status });
		if (!updatedMessage) {
			sendError(res, 404, "Message non trouvé");
			return;
		}
		res.status(200).json(updatedMessage);
	} catch (err) {
		logger.error("Erreur lors de la mise à jour du statut :", err);
		sendError(res, 500, "Erreur lors de la mise à jour du statut du message");
	}
};

// Supprime un message
// DELETE /messages/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const messageId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(messageId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const deleted: boolean = await messagesAdminModel.deleteOne(messageId);
		if (!deleted) {
			sendError(res, 404, "Message non trouvé");
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error("Erreur lors de la suppression du message :", err);
		sendError(res, 500, "Erreur lors de la suppression du message");
	}
};

export { browseAll, readById, editStatus, destroy };
