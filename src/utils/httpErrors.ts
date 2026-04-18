import type { Response } from "express";

type ErrorResponseBody = {
	error: string;
	code?: string;
};

function sendError(
	res: Response,
	status: number,
	message: string,
	code?: string,
): void {
	const body: ErrorResponseBody = code
		? { error: message, code }
		: { error: message };

	res.status(status).json(body);
}

/** Erreur métier / client avec statut HTTP explicite (à gérer dans le middleware ou le catch du contrôleur). */
class HttpError extends Error {
	readonly statusCode: number;
	readonly code?: string;

	constructor(statusCode: number, message: string, code?: string) {
		super(message);
		this.name = "HttpError";
		this.statusCode = statusCode;
		this.code = code;
	}
}

function isHttpError(err: unknown): err is HttpError {
	return err instanceof HttpError;
}

export { sendError, HttpError, isHttpError };
