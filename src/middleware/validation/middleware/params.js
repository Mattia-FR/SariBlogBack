const { z } = require("zod");
const schemas = require("../schemas");

// =================================================================
// MIDDLEWARE DE VALIDATION DES PARAMÈTRES
// =================================================================

// Validation pour les noms de fichiers
const validateFilename = (req, res, next) => {
	try {
		const validatedParams = schemas.filename.parse(req.params);
		req.params = validatedParams;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "INVALID_FILENAME",
					message: "Nom de fichier invalide",
					details: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
						received: err.received,
					})),
				},
			});
		}
		next(error);
	}
};

module.exports = {
	validateFilename,
};
