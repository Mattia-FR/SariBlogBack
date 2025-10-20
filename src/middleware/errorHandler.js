const winston = require("winston");

// Configuration Winston
const logger = winston.createLogger({
	level: "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	defaultMeta: { service: "sariblog-api" },
	transports: [
		new winston.transports.File({ filename: "logs/error.log", level: "error" }),
		new winston.transports.File({ filename: "logs/combined.log" }),
	],
});

// Gestionnaire d'erreurs centralisé
const errorHandler = (err, req, res, next) => {
	// Log de l'erreur
	logger.error({
		message: err.message,
		stack: err.stack,
		url: req.url,
		method: req.method,
		ip: req.ip,
		userAgent: req.get("User-Agent"),
	});

	// Erreur de validation
	if (err.name === "ValidationError") {
		return res.status(400).json({
			success: false,
			error: {
				code: "VALIDATION_ERROR",
				message: "Validation failed",
				details: err.details,
			},
		});
	}

	// Erreur de base de données
	if (err.code === "ER_DUP_ENTRY") {
		return res.status(409).json({
			success: false,
			error: {
				code: "DUPLICATE_ENTRY",
				message: "Resource already exists",
			},
		});
	}

	// Erreur par défaut
	res.status(err.status || 500).json({
		success: false,
		error: {
			code: err.code || "INTERNAL_SERVER_ERROR",
			message: err.message || "Internal server error",
			details: process.env.NODE_ENV === "development" ? err.stack : undefined,
		},
	});
};

// Gestionnaire pour les routes non trouvées
const notFoundHandler = (req, res) => {
	res.status(404).json({
		success: false,
		error: {
			code: "NOT_FOUND",
			message: `Route ${req.method} ${req.path} not found`,
		},
	});
};

module.exports = {
	errorHandler,
	notFoundHandler,
	logger,
};
