import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
		return res.sendStatus(401); // non authentifié
	}

	// Format attendu : "Bearer <token>"
	const parts = authHeader.split(" ");

	if (parts.length !== 2 || parts[0] !== "Bearer") {
		return res.sendStatus(401); // format invalide
	}

	const token = parts[1];

	if (!token) {
		return res.sendStatus(401); // token manquant
	}

	// 2. Vérifier que le secret existe
	const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
	if (!ACCESS_SECRET) {
		console.error("ACCESS_TOKEN_SECRET non défini");
		return res.sendStatus(500);
	}

	try {
		// 3. Vérification + décodage du JWT
		const payload = jwt.verify(token, ACCESS_SECRET) as {
			userId: number;
			role: string;
		};

		// Validation du payload
		if (!payload.userId || !payload.role) {
			return res.sendStatus(401);
		}

		// 4. On attache l'utilisateur à la requête
		req.user = {
			userId: payload.userId,
			role: payload.role,
		};

		next();
	} catch (err) {
		// Token invalide, expiré, ou erreur de vérification
		if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
			return res.sendStatus(401);
		}
		console.error("Erreur lors de la vérification du token :", err);
		return res.sendStatus(500);
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
		console.error("ACCESS_TOKEN_SECRET non défini");
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
