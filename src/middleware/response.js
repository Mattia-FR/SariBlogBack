// Middleware de réponse standardisée
const standardResponse = (req, res, next) => {
	// Méthode de succès
	res.success = (data, message = null) => {
		res.json({
			success: true,
			data,
			...(message && { message }),
		});
	};

	// Méthode d'erreur - Signature simplifiée et cohérente
	res.error = (message, statusCode = 500) => {
		res.status(statusCode).json({
			success: false,
			error: {
				code: "ERROR",
				message,
			},
		});
	};

	next();
};

// Middleware de cache
const cacheHeaders = (req, res, next) => {
	// Cache selon le type de ressource
	if (req.path.includes("/about")) {
		res.set("Cache-Control", "public, max-age=3600"); // 1 heure
	} else if (
		req.path.includes("/articles") ||
		req.path.includes("/illustrations")
	) {
		res.set("Cache-Control", "public, max-age=300"); // 5 minutes
	}

	// ETag pour la validation conditionnelle
	res.set("ETag", `"${Date.now()}"`);

	next();
};

module.exports = {
	standardResponse,
	cacheHeaders,
};
