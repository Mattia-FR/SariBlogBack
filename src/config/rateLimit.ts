import rateLimit from "express-rate-limit";
import { HttpError } from "../utils/httpErrors";

function createLimiter(message: string) {
	return rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		limit: 5, // Limite de 5 requêtes par IP
		handler: (_req, _res, next) => {
			next(new HttpError(429, message, "RATE_LIMITED"));
		},
	});
}

export const loginLimiter = createLimiter(
	"Trop de tentatives de connexion. Veuillez réessayer plus tard.",
);

export const messagesLimiter = createLimiter(
	"Trop de messages. Veuillez réessayer plus tard.",
);

export const commentsLimiter = createLimiter(
	"Trop de commentaires. Veuillez réessayer plus tard.",
);
