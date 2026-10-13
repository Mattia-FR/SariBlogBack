import type { Request, Response } from "express";
import commentsAdminModel from "../../model/admin/commentsAdminModel";
import type { Comment, CommentStatus } from "../../types/comments";
import { HttpError } from "../../utils/httpErrors";
import { parseIdParam, parsePaginationParams } from "../../utils/requestParams";

const VALID_STATUSES: CommentStatus[] = [
	"pending",
	"approved",
	"rejected",
	"spam",
];

// Liste paginée des commentaires. Query : page, limit (1–20), status optionnel (pending | approved | rejected | spam).
// GET /admin/comments?page=1&limit=10&status=pending
const browseAll = async (req: Request, res: Response): Promise<void> => {
	const { page, limit } = parsePaginationParams(req.query);

	let status: CommentStatus | undefined;
	const statusRaw = req.query.status;
	if (statusRaw !== undefined && statusRaw !== "") {
		const s = String(statusRaw);
		if (!VALID_STATUSES.includes(s as CommentStatus)) {
			throw new HttpError(400, "Statut de filtre invalide");
		}
		status = s as CommentStatus;
	}

	const [{ comments, total }, counts] = await Promise.all([
		commentsAdminModel.findAllPaginated(page, limit, status),
		commentsAdminModel.findTabCounts(),
	]);

	res.status(200).json({ comments, total, page, limit, counts });
};

// Récupère un commentaire par ID
// GET /admin/comments/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const commentId = parseIdParam(req.params.id);
	const comment: Comment | null = await commentsAdminModel.findById(commentId);
	if (!comment) {
		throw new HttpError(404, "Commentaire non trouvé");
	}
	res.status(200).json(comment);
};

// Met à jour le statut d'un commentaire
// PATCH /admin/comments/:id/status
const editStatus = async (req: Request, res: Response): Promise<void> => {
	const commentId = parseIdParam(req.params.id);
	const { status } = req.body;
	if (!VALID_STATUSES.includes(status)) {
		throw new HttpError(400, "Statut invalide");
	}
	const updatedComment: Comment | null = await commentsAdminModel.updateStatus(
		commentId,
		{ status },
	);
	if (!updatedComment) {
		throw new HttpError(404, "Commentaire non trouvé");
	}
	res.status(200).json(updatedComment);
};

// Supprime un commentaire
// DELETE /admin/comments/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const commentId = parseIdParam(req.params.id);
	const deleted: boolean = await commentsAdminModel.deleteOne(commentId);
	if (!deleted) {
		throw new HttpError(404, "Commentaire non trouvé");
	}
	res.sendStatus(204);
};

export { browseAll, readById, editStatus, destroy };
