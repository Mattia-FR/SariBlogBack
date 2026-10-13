import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
	type ErrorCode,
	type ErrorResponseBody,
	HttpError,
} from "../utils/httpErrors";
import logger from "../utils/logger";
import { isMissingReference, isRowStillReferenced } from "../utils/mysqlErrors";

type ResolvedError = { status: number; body: ErrorResponseBody };

const MULTER_ERRORS: Record<string, { error: string; code: ErrorCode }> = {
	LIMIT_FILE_SIZE: { error: "Fichier trop volumineux", code: "FILE_TOO_LARGE" },
	LIMIT_UNEXPECTED_FILE: {
		error: "Fichier non autorisé",
		code: "INVALID_FILE_TYPE",
	},
	LIMIT_FILE_COUNT: {
		error: "Trop de fichiers envoyés",
		code: "BAD_REQUEST",
	},
};

function resolveError(err: unknown): ResolvedError {
	if (err instanceof HttpError) {
		return {
			status: err.statusCode,
			body: { error: err.message, code: err.code },
		};
	}

	if (err instanceof ZodError) {
		return {
			status: 400,
			body: {
				error: "Données invalides",
				code: "VALIDATION_ERROR",
				details: err.issues,
			},
		};
	}

	const { code, type } = (err ?? {}) as { code?: unknown; type?: unknown };

	if (typeof code === "string" && code in MULTER_ERRORS) {
		return { status: 400, body: MULTER_ERRORS[code] };
	}

	if (type === "entity.parse.failed") {
		return {
			status: 400,
			body: { error: "JSON invalide", code: "INVALID_JSON" },
		};
	}

	if (type === "entity.too.large") {
		return {
			status: 413,
			body: { error: "Requête trop volumineuse", code: "FILE_TOO_LARGE" },
		};
	}

	if (isMissingReference(err)) {
		return {
			status: 400,
			body: {
				error: "Une ressource liée est introuvable",
				code: "INVALID_REFERENCE",
			},
		};
	}

	if (isRowStillReferenced(err)) {
		return {
			status: 409,
			body: {
				error: "Cette ressource est encore utilisée ailleurs",
				code: "CONFLICT",
			},
		};
	}

	return {
		status: 500,
		body: { error: "Erreur serveur", code: "INTERNAL_ERROR" },
	};
}

/**
 * Seul point de traduction et de journalisation des erreurs de l'API.
 * Les contrôleurs et models lèvent ; Express 5 relaie les rejets async ici.
 */
export function errorHandler(
	err: unknown,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (res.headersSent) {
		return next(err);
	}

	const { status, body } = resolveError(err);
	const route = `${req.method} ${req.originalUrl}`;

	if (status >= 500) {
		logger.error(`${route} → ${status}`, err);
	} else {
		logger.warn(`${route} → ${status} ${body.code}: ${body.error}`);
	}

	res.status(status).json(body);
}
