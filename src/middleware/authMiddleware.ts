import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/httpErrors";
import logger from "../utils/logger";

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

function requireAuth(req: Request, res: Response, next: NextFunction) {
	// 1. Lire le token depuis le header Authorization
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return sendError(res, 401, "Non authentifié");
	}

	// Format attendu : "Bearer <token>"
	const parts = authHeader.split(" ");

	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return sendError(res, 401, "Format Authorization invalide");
	}

	const token = parts[1];

	if (!token) {
		return sendError(res, 401, "Token manquant");
	}

	// 2. Vérifier que le secret existe
	const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
	if (!ACCESS_SECRET) {
		logger.error("ACCESS_TOKEN_SECRET non défini");
		return sendError(res, 500, "JWT secrets non définis");
	}

	try {
		// 3. Vérification + décodage du JWT
		const payload = jwt.verify(token, ACCESS_SECRET) as {
			userId: number;
			role: string;
		};

		// Validation du payload
		if (!payload.userId || !payload.role) {
			return sendError(res, 401, "Token invalide");
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
			return sendError(res, 401, "Token invalide ou expiré");
		}
		logger.error("Erreur lors de la vérification du token :", err);
		return sendError(res, 500, "Erreur lors de la vérification du token");
	}
}

// Middleware d'authentification optionnel : vérifie le token si présent
// mais ne bloque pas la requête si absent ou invalide
// Permet d'avoir req.user disponible si l'utilisateur est connecté
function optionalAuth(req: Request, res: Response, next: NextFunction) {
	// 1. Lire le token depuis le header Authorization
	const authHeader = req.headers.authorization;

	// Si pas de header, on continue sans authentification
	if (!authHeader) {
		return next();
	}

	// Format attendu : "Bearer <token>"
	const parts = authHeader.split(" ");

	if (parts.length !== 2 || parts[0] !== "Bearer") {
		// Format invalide, on continue sans authentification
		return next();
	}

	const token = parts[1];

	if (!token) {
		// Token manquant, on continue sans authentification
		return next();
	}

	// 2. Vérifier que le secret existe
	const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
	if (!ACCESS_SECRET) {
		logger.error("ACCESS_TOKEN_SECRET non défini");
		// On continue sans authentification plutôt que de bloquer
		return next();
	}

	try {
		// 3. Vérification + décodage du JWT
		const payload = jwt.verify(token, ACCESS_SECRET) as {
			userId: number;
			role: string;
		};

		// Validation du payload
		if (payload.userId && payload.role) {
			// 4. On attache l'utilisateur à la requête
			req.user = {
				userId: payload.userId,
				role: payload.role,
			};
		}
	} catch (err) {
		// Token invalide ou expiré : on continue sans authentification
		// Pas de log d'erreur car c'est normal pour les visiteurs non connectés
	}

	// On continue toujours, même si l'authentification a échoué
	next();
}

export { requireAuth, optionalAuth };
