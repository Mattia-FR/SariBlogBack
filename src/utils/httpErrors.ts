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

export { sendError };
