const { z } = require("zod");
const schemas = require("../schemas");

// =================================================================
// MIDDLEWARE DE VALIDATION GÉNÉRIQUE
// =================================================================

// Fonction utilitaire pour créer un middleware de validation
const createValidationMiddleware = (schema, errorCode = "VALIDATION_ERROR") => {
	return (req, res, next) => {
		try {
			const validatedData = schema.parse(req.body);
			req.body = validatedData;
			next();
		} catch (error) {
			if (error instanceof z.ZodError) {
				return res.status(400).json({
					success: false,
					error: {
						code: errorCode,
						message: "Validation failed",
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
};

// =================================================================
// MIDDLEWARE DE VALIDATION SPÉCIFIQUES
// =================================================================

// Validation des données de contact
const validateContact = createValidationMiddleware(
	schemas.contact,
	"CONTACT_VALIDATION_ERROR",
);

// Validation pour la connexion
const validateLogin = createValidationMiddleware(
	schemas.login,
	"LOGIN_VALIDATION_ERROR",
);

// Validation pour les articles
const validateArticle = createValidationMiddleware(
	schemas.article,
	"ARTICLE_VALIDATION_ERROR",
);

// Validation pour les illustrations
const validateIllustration = createValidationMiddleware(
	schemas.illustration,
	"ILLUSTRATION_VALIDATION_ERROR",
);

// Validation pour les tags
const validateTag = createValidationMiddleware(
	schemas.tag,
	"TAG_VALIDATION_ERROR",
);

// Validation pour les utilisateurs
const validateUser = createValidationMiddleware(
	schemas.user,
	"USER_VALIDATION_ERROR",
);

// Validation pour la modification d'utilisateurs
const validateUserUpdate = createValidationMiddleware(
	schemas.userUpdate,
	"USER_UPDATE_VALIDATION_ERROR",
);

// Validation pour le changement de mot de passe
const validatePasswordChange = createValidationMiddleware(
	schemas.passwordChange,
	"PASSWORD_CHANGE_VALIDATION_ERROR",
);

// Validation pour la page "À propos" (avec logique conditionnelle)
const validateAbout = (req, res, next) => {
	try {
		// Déterminer quel schéma utiliser selon la route
		let schema;
		if (req.path.includes("/content")) {
			schema = schemas.aboutContent;
		} else if (req.path.includes("/image")) {
			schema = schemas.aboutImage;
		} else {
			schema = schemas.about;
		}

		const validatedData = schema.parse(req.body);
		req.body = validatedData;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "ABOUT_VALIDATION_ERROR",
					message: "Validation failed",
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
	validateContact,
	validateLogin,
	validateArticle,
	validateIllustration,
	validateAbout,
	validateTag,
	validateUser,
	validateUserUpdate,
	validatePasswordChange,
};
