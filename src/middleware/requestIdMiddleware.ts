import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

declare global {
	namespace Express {
		interface Request {
			requestId?: string;
		}
	}
}

export function requestId(req: Request, res: Response, next: NextFunction) {
	const id = crypto.randomUUID();
	req.requestId = id;
	res.setHeader("X-Request-Id", id);
	next();
}
