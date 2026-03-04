import type { Request, Response, NextFunction } from "express";

export function errorHandler(
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	console.error("Erreur:", err);

	if (err.code === "LIMIT_FILE_SIZE") {
		return res.status(400).json({ error: "Fichier trop volumineux" });
	}

	if (err.code === "LIMIT_UNEXPECTED_FILE") {
		return res.status(400).json({ error: "Fichier non autorisé" });
	}

	if (err.code === "LIMIT_FILE_COUNT") {
		return res.status(400).json({ error: "Trop de fichiers envoyés" });
	}

	res.status(500).json({ error: "Erreur serveur" });
}
