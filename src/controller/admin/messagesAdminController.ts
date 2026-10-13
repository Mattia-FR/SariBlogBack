import type { Request, Response } from "express";
import messagesAdminModel from "../../model/admin/messagesAdminModel";
import type { Message, MessageStatus } from "../../types/messages";
import { HttpError } from "../../utils/httpErrors";
import { parseIdParam, parsePaginationParams } from "../../utils/requestParams";

const VALID_STATUSES: MessageStatus[] = ["unread", "read", "archived"];

// Liste paginée des messages. Query : page, limit (1–20), status optionnel (unread | read | archived).
// GET /admin/messages?page=1&limit=10&status=unread
const browseAll = async (req: Request, res: Response): Promise<void> => {
	const { page, limit } = parsePaginationParams(req.query);

	let status: MessageStatus | undefined;
	const statusRaw = req.query.status;
	if (statusRaw !== undefined && statusRaw !== "") {
		const s = String(statusRaw);
		if (!VALID_STATUSES.includes(s as MessageStatus)) {
			throw new HttpError(400, "Statut de filtre invalide");
		}
		status = s as MessageStatus;
	}

	const [{ messages, total }, counts] = await Promise.all([
		messagesAdminModel.findAllPaginated(page, limit, status),
		messagesAdminModel.findTabCounts(),
	]);

	res.status(200).json({ messages, total, page, limit, counts });
};

// Récupère un message par ID
// GET /admin/messages/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const messageId = parseIdParam(req.params.id);
	const message: Message | null = await messagesAdminModel.findById(messageId);
	if (!message) {
		throw new HttpError(404, "Message non trouvé");
	}
	res.status(200).json(message);
};

// Met à jour le statut d'un message
// PATCH /admin/messages/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	const messageId = parseIdParam(req.params.id);
	const { status } = req.body;
	if (!VALID_STATUSES.includes(status)) {
		throw new HttpError(400, "Statut invalide");
	}
	const updatedMessage: Message | null = await messagesAdminModel.updateStatus(
		messageId,
		{ status },
	);
	if (!updatedMessage) {
		throw new HttpError(404, "Message non trouvé");
	}
	res.status(200).json(updatedMessage);
};

// Supprime un message
// DELETE /admin/messages/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const messageId = parseIdParam(req.params.id);
	const deleted: boolean = await messagesAdminModel.deleteOne(messageId);
	if (!deleted) {
		throw new HttpError(404, "Message non trouvé");
	}
	res.sendStatus(204);
};

export { browseAll, readById, editStatus, destroy };
