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
			imgSrc: ["'self'", "data:", "https:", "http://localhost:4242"], // Images autorisées
			scriptSrc: ["'self'"], // Scripts seulement depuis ton domaine
			styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
		},
	},
	crossOriginEmbedderPolicy: false, // Désactivé pour éviter les conflits
	crossOriginResourcePolicy: false,
});

// ===== RATE LIMITS SPÉCIALISÉS =====
// Pourquoi c'est important :
// Protection DDoS : Évite qu'une IP spamme ton serveur
// Protection contact : Empêche l'envoi massif de messages
// Économie ressources : Limite la charge serveur

// Rate limiting pour la navigation/lecture (plus permissif)
// Utilisé pour : articles, illustrations, about, images statiques
const browseRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 1000, // 1000 requêtes par IP - permet une navigation fluide
	message: {
		success: false,
		error: {
			code: "BROWSE_RATE_LIMIT_EXCEEDED",
			message: "Trop de requêtes de navigation, veuillez réessayer plus tard.",
		},
	},
	// Ignorer les requêtes HEAD (utilisées par les crawlers)
	skip: (req) => req.method === "HEAD",
	// Standardiser les headers pour éviter les problèmes de proxy
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting pour les routes d'écriture (modéré)
// Utilisé pour : upload, modifications admin
const writeRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requêtes par IP - modéré pour les opérations d'écriture
	message: {
		success: false,
		error: {
			code: "WRITE_RATE_LIMIT_EXCEEDED",
			message: "Trop de requêtes d'écriture, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting pour les routes sensibles (très strict)
// Utilisé pour : contact, authentification
const sensitiveRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // 10 requêtes par IP - très strict pour les opérations sensibles
	message: {
		success: false,
		error: {
			code: "SENSITIVE_RATE_LIMIT_EXCEEDED",
			message:
				"Trop de requêtes sur des opérations sensibles, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting spécifique pour le contact (très restrictif)
const contactRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 messages par IP - empêche le spam
	message: {
		success: false,
		error: {
			code: "CONTACT_RATE_LIMIT_EXCEEDED",
			message:
				"Trop de messages de contact envoyés, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting pour l'authentification (très restrictif)
const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 tentatives de connexion par IP - empêche les attaques par force brute
	message: {
		success: false,
		error: {
			code: "AUTH_RATE_LIMIT_EXCEEDED",
			message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting pour les routes admin (modéré)
// Utilisé pour : toutes les routes /admin/*
const adminRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 200, // 200 requêtes par IP - modéré pour les opérations admin
	message: {
		success: false,
		error: {
			code: "ADMIN_RATE_LIMIT_EXCEEDED",
			message: "Trop de requêtes admin, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiting global de sécurité (très permissif mais présent)
// Utilisé comme filet de sécurité global
const globalSafetyRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 2000, // 2000 requêtes par IP - très permissif, juste pour éviter les abus extrêmes
	message: {
		success: false,
		error: {
			code: "GLOBAL_RATE_LIMIT_EXCEEDED",
			message: "Trop de requêtes globales, veuillez réessayer plus tard.",
		},
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// ===== FONCTIONS UTILITAIRES =====

// Fonction pour créer un rate limit personnalisé
const createCustomRateLimit = (options) => {
	return rateLimit({
		windowMs: options.windowMs || 15 * 60 * 1000,
		max: options.max || 100,
		message: options.message || {
			success: false,
			error: {
				code: "CUSTOM_RATE_LIMIT_EXCEEDED",
				message: "Trop de requêtes, veuillez réessayer plus tard.",
			},
		},
		standardHeaders: true,
		legacyHeaders: false,
		...options,
	});
};

// Fonction pour appliquer le bon rate limit selon le type de route
const getRateLimitForRoute = (routeType) => {
	switch (routeType) {
		case "browse":
			return browseRateLimit;
		case "write":
			return writeRateLimit;
		case "sensitive":
			return sensitiveRateLimit;
		case "contact":
			return contactRateLimit;
		case "auth":
			return authRateLimit;
		case "admin":
			return adminRateLimit;
		default:
			return globalSafetyRateLimit;
	}
};

// ===== EXPORTS =====

module.exports = {
	// Configuration Helmet
	helmetConfig,

	// Rate limits spécialisés
	browseRateLimit, // Navigation/lecture (1000 req/15min)
	writeRateLimit, // Écriture (100 req/15min)
	sensitiveRateLimit, // Sensible (10 req/15min)
	contactRateLimit, // Contact (5 req/15min)
	authRateLimit, // Auth (5 req/15min)
	adminRateLimit, // Admin (200 req/15min)
	globalSafetyRateLimit, // Sécurité globale (2000 req/15min)

	// Fonctions utilitaires
	createCustomRateLimit,
	getRateLimitForRoute,

	// Compression
	compression: compression(),

	// Anciens exports pour compatibilité (dépréciés)
	generalRateLimit: globalSafetyRateLimit, // Alias pour compatibilité
};
