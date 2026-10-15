import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpErrors";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: number;
				role: string;
			};
		}
	}
}

function requireAuth(req: Request, _res: Response, next: NextFunction) {
	// 1. Lire le token depuis le header Authorization
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return next(new HttpError(401, "Non authentifié"));
	}

	// Format attendu : "Bearer <token>"
	const parts = authHeader.split(" ");

	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return next(new HttpError(401, "Format Authorization invalide"));
	}

	const token = parts[1];

	if (!token) {
		return next(new HttpError(401, "Token manquant"));
	}

	// 2. Vérifier que le secret existe (erreur de configuration → 500 journalisé par errorHandler)
	const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
	if (!ACCESS_SECRET) {
		return next(new Error("ACCESS_TOKEN_SECRET non défini"));
	}

	try {
		// 3. Vérification + décodage du JWT
		const payload = jwt.verify(token, ACCESS_SECRET) as {
			userId: number;
			role: string;
		};

		// Validation du payload
		if (!payload.userId || !payload.role) {
			return next(new HttpError(401, "Token invalide"));
		}

		// 4. On attache l'utilisateur à la requête
		req.user = {
			userId: payload.userId,
			role: payload.role,
		};

		next();
	} catch (err) {
		// Token invalide, expiré, ou erreur de vérification
		if (
			err instanceof jwt.JsonWebTokenError ||
			err instanceof jwt.TokenExpiredError
		) {
			return next(new HttpError(401, "Token invalide ou expiré"));
		}
		next(err);
	}
}

export { requireAuth };
