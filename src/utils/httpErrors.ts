/**
 * Contrat d'erreur de l'API : { error: string, code: ErrorCode, details?: ZodIssue[] }.
 * Toute erreur passe par `errorHandler` (middleware/errorMiddleware.ts), seul point
 * de traduction et de journalisation. Les contrôleurs se contentent de `throw new HttpError(...)`.
 * Liste recopiée côté front dans `Front/src/utils/apiError.ts`.
 */
export type ErrorCode =
	| "VALIDATION_ERROR"
	| "INVALID_JSON"
	| "BAD_REQUEST"
	| "UNAUTHENTICATED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "ROUTE_NOT_FOUND"
	| "CONFLICT"
	| "INVALID_REFERENCE"
	| "RATE_LIMITED"
	| "FILE_TOO_LARGE"
	| "INVALID_FILE_TYPE"
	| "INTERNAL_ERROR"
	| "ARTICLE_SLUG_TAKEN"
	| "TAG_TAKEN"
	| "CATEGORY_TAKEN"
	| "USER_IDENTIFIER_TAKEN";

export type ErrorResponseBody = {
	error: string;
	code: ErrorCode;
	details?: unknown;
};

function defaultCodeForStatus(status: number): ErrorCode {
	switch (status) {
		case 400:
			return "BAD_REQUEST";
		case 401:
			return "UNAUTHENTICATED";
		case 403:
			return "FORBIDDEN";
		case 404:
			return "NOT_FOUND";
		case 409:
			return "CONFLICT";
		case 413:
			return "FILE_TOO_LARGE";
		case 429:
			return "RATE_LIMITED";
		default:
			return status >= 500 ? "INTERNAL_ERROR" : "BAD_REQUEST";
	}
}

/** Erreur métier / client avec statut HTTP explicite, traduite en JSON par `errorHandler`. */
class HttpError extends Error {
	readonly statusCode: number;
	readonly code: ErrorCode;

	constructor(statusCode: number, message: string, code?: ErrorCode) {
		super(message);
		this.name = "HttpError";
		this.statusCode = statusCode;
		this.code = code ?? defaultCodeForStatus(statusCode);
	}
}

function isHttpError(err: unknown): err is HttpError {
	return err instanceof HttpError;
}

export { HttpError, isHttpError, defaultCodeForStatus };
