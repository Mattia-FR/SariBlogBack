import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
	namespace Express {
		interface Request {
			user?: {
				userId: number;
				email: string;
				role?: string;
			};
		}
	}
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
	// 1. On lit le cookie envoyé automatiquement par le navigateur
	const token = req.cookies?.access_token;

	if (!token) {
		return res.sendStatus(401); // non authentifié
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		console.error("JWT_SECRET non défini");
		return res.sendStatus(500);
	}

	try {
		// 2. Vérification + décodage du JWT
		const payload = jwt.verify(token, secret) as {
			userId: number;
			email: string;
			role?: string;
		};

		// 3. On attache l'utilisateur à la requête
		req.user = payload;

		next();
	} catch {
		return res.sendStatus(401); // token invalide / expiré
	}
}

export { requireAuth };
