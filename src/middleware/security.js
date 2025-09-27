const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

// Configuration Helmet
// Helmet ajoute automatiquement des headers de sécurité HTTP pour protéger contre :
// XSS (Cross-Site Scripting)
// Clickjacking
// MIME sniffing
// Content Security Policy (CSP)
const helmetConfig = helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"], // Seulement depuis ton domaine
			imgSrc: ["'self'", "data:", "https:"], // Images autorisées
			scriptSrc: ["'self'"], // Scripts seulement depuis ton domaine
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
		},
	},
	crossOriginEmbedderPolicy: false, // Désactivé pour éviter les conflits
});

// Rate limiting général
const generalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requêtes par IP
	message: {
		success: false,
		error: {
			code: "RATE_LIMIT_EXCEEDED",
			message: "Too many requests, please try again later.",
		},
	},
});

// Rate limiting pour contact
const contactRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 messages par IP
	message: {
		success: false,
		error: {
			code: "CONTACT_RATE_LIMIT_EXCEEDED",
			message: "Too many contact messages sent, please try again later.",
		},
	},
});

// Pourquoi c'est important :
// Protection DDoS : Évite qu'une IP spamme ton serveur
// Protection contact : Empêche l'envoi massif de messages
// Économie ressources : Limite la charge serveur

// Rate limiting pour l'authentification
const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 tentatives de connexion par IP
	message: {
		success: false,
		error: {
			code: "AUTH_RATE_LIMIT_EXCEEDED",
			message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
		},
	},
});

module.exports = {
	helmetConfig,
	generalRateLimit,
	contactRateLimit,
	authRateLimit,
	compression: compression(),
};
