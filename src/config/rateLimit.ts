import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limite de 5 requêtes par IP
	message: {
		error: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
	},
});

export const messagesLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limite de 5 requêtes par IP
	message: { error: "Trop de messages. Veuillez réessayer plus tard." },
});

export const commentsLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // Limite de 5 requêtes par IP
	message: { error: "Trop de commentaires. Veuillez réessayer plus tard." },
});
