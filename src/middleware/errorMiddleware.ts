import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import logger from "../utils/logger";

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	logger.error("Erreur:", err);

	if (err instanceof ZodError) {
		return res.status(400).json({
			error: "Données invalides",
			details: err.issues,
		});
	}

	const error = err as { code?: string };

	if (error.code === "LIMIT_FILE_SIZE") {
		return res.status(400).json({ error: "Fichier trop volumineux" });
	}

	if (error.code === "LIMIT_UNEXPECTED_FILE") {
		return res.status(400).json({ error: "Fichier non autorisé" });
	}

	if (error.code === "LIMIT_FILE_COUNT") {
		return res.status(400).json({ error: "Trop de fichiers envoyés" });
	}

	res.status(500).json({ error: "Erreur serveur" });
}
