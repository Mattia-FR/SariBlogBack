import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validate(schema: z.ZodSchema) {
	return (req: Request, _res: Response, next: NextFunction) => {
		try {
			req.body = schema.parse(req.body);
			next();
		} catch (err) {
			next(err);
		}
	};
}
