const { z } = require("zod");

// =================================================================
// SCHÉMAS DE BASE
// =================================================================

// Schéma de pagination
const paginationSchema = z.object({
	limit: z.coerce.number().int().min(1).max(50).default(10),
	offset: z.coerce.number().int().min(0).default(0),
});

// Schéma pour les IDs
const idSchema = z.object({
	id: z.coerce.number().int().positive(),
});

// Schéma pour les slugs
const slugSchema = z.object({
	slug: z
		.string()
		.regex(
			/^[a-z0-9-]+$/,
			"Slug must contain only lowercase letters, numbers and hyphens",
		),
});

// =================================================================
// SCHÉMAS DE DONNÉES PUBLIQUES
// =================================================================

// Schéma pour les messages de contact
const contactSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email("Format d'email invalide"),
	subject: z.string().max(150).optional().default(""),
	message: z.string().min(10).max(1000),
});

// =================================================================
// SCHÉMAS D'AUTHENTIFICATION
// =================================================================

// Schéma pour la connexion
const loginSchema = z.object({
	email: z.string().email("Format d'email invalide"),
	password: z
		.string()
		.min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// =================================================================
// SCHÉMAS ADMIN ARTICLES
// =================================================================

// Schéma pour créer/modifier un article
const articleSchema = z.object({
	title: z
		.string()
		.min(1, "Le titre est requis")
		.max(255, "Le titre est trop long"),
	excerpt: z.string().max(500, "L'extrait est trop long").optional(),
	content: z.string().min(1, "Le contenu est requis"),
	image: z.string().max(255, "Le nom de l'image est trop long").optional(),
	status: z
		.enum(["draft", "published"], {
			errorMap: () => ({
				message: "Le statut doit être 'draft' ou 'published'",
			}),
		})
		.optional(),
	tagIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

// =================================================================
// SCHÉMAS ADMIN ILLUSTRATIONS
// =================================================================

// Schéma pour créer/modifier une illustration
const illustrationSchema = z.object({
	title: z.string().max(255, "Le titre est trop long").optional(),
	description: z
		.string()
		.max(1000, "La description est trop longue")
		.optional(),
	image: z.string().max(255, "Le nom de l'image est trop long"),
	alt_text: z.string().max(255, "Le texte alternatif est trop long").optional(),
	is_in_gallery: z.boolean().optional().default(false),
	tagIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

// =================================================================
// SCHÉMAS ADMIN ABOUT
// =================================================================

// Schéma pour modifier la page "À propos"
const aboutSchema = z.object({
	content: z
		.string()
		.min(1, "Le contenu est requis")
		.max(5000, "Le contenu est trop long"),
	image: z.string().max(255, "Le nom de l'image est trop long").optional(),
});

// Schéma pour modifier seulement le contenu
const aboutContentSchema = z.object({
	content: z
		.string()
		.min(1, "Le contenu est requis")
		.max(5000, "Le contenu est trop long"),
});

// Schéma pour modifier seulement l'image
const aboutImageSchema = z.object({
	image: z.string().max(255, "Le nom de l'image est trop long"),
});

// =================================================================
// SCHÉMAS ADMIN TAGS
// =================================================================

// Schéma pour créer/modifier un tag
const tagSchema = z.object({
	name: z
		.string()
		.min(1, "Le nom du tag est requis")
		.max(50, "Le nom du tag est trop long"),
});

// =================================================================
// SCHÉMAS ADMIN UPLOAD
// =================================================================

// Schéma pour valider le nom de fichier
const filenameSchema = z.object({
	filename: z
		.string()
		.min(1, "Le nom de fichier est requis")
		.max(255, "Le nom de fichier est trop long"),
});

// =================================================================
// SCHÉMAS ADMIN UTILISATEURS
// =================================================================

// Schéma pour créer un utilisateur
const userSchema = z.object({
	username: z
		.string()
		.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
		.max(50, "Le nom d'utilisateur est trop long"),
	email: z.string().email("Format d'email invalide"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.max(100, "Le mot de passe est trop long"),
	role: z
		.enum(["admin", "editor"], {
			errorMap: () => ({
				message: "Le rôle doit être 'admin' ou 'editor'",
			}),
		})
		.optional()
		.default("editor"),
});

// Schéma pour modifier un utilisateur
const userUpdateSchema = z.object({
	username: z
		.string()
		.min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
		.max(50, "Le nom d'utilisateur est trop long")
		.optional(),
	email: z.string().email("Format d'email invalide").optional(),
	role: z
		.enum(["admin", "editor"], {
			errorMap: () => ({
				message: "Le rôle doit être 'admin' ou 'editor'",
			}),
		})
		.optional(),
	is_active: z.boolean().optional(),
});

// Schéma pour changer le mot de passe
const passwordChangeSchema = z.object({
	newPassword: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.max(100, "Le mot de passe est trop long"),
});

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
// MIDDLEWARE DE VALIDATION SPÉCIALISÉS
// =================================================================

// Middleware de validation des paramètres de pagination
const validatePagination = (req, res, next) => {
	try {
		const validatedQuery = paginationSchema.parse(req.query);
		req.query = validatedQuery;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "INVALID_PAGINATION",
					message: "Invalid pagination parameters",
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

// Middleware de validation des IDs
const validateId = (req, res, next) => {
	try {
		const validatedParams = idSchema.parse(req.params);
		req.params = validatedParams;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "INVALID_ID",
					message: "Invalid ID parameter",
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

// Middleware de validation des slugs
const validateSlug = (req, res, next) => {
	try {
		const validatedParams = slugSchema.parse(req.params);
		req.params = validatedParams;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "INVALID_SLUG",
					message: "Invalid slug parameter",
					details: error.errors
						? error.errors.map((err) => ({
								field: err.path.join("."),
								message: err.message,
								received: err.received,
							}))
						: [],
				},
			});
		}
		next(error);
	}
};

// =================================================================
// MIDDLEWARE DE VALIDATION SPÉCIFIQUES
// =================================================================

// Validation des données de contact
const validateContact = createValidationMiddleware(
	contactSchema,
	"CONTACT_VALIDATION_ERROR",
);

// Validation pour la connexion
const validateLogin = createValidationMiddleware(
	loginSchema,
	"LOGIN_VALIDATION_ERROR",
);

// Validation pour les articles
const validateArticle = createValidationMiddleware(
	articleSchema,
	"ARTICLE_VALIDATION_ERROR",
);

// Validation pour les illustrations
const validateIllustration = createValidationMiddleware(
	illustrationSchema,
	"ILLUSTRATION_VALIDATION_ERROR",
);

// Validation pour la page "À propos" (avec logique conditionnelle)
const validateAbout = (req, res, next) => {
	try {
		// Déterminer quel schéma utiliser selon la route
		let schema;
		if (req.path.includes("/content")) {
			schema = aboutContentSchema;
		} else if (req.path.includes("/image")) {
			schema = aboutImageSchema;
		} else {
			schema = aboutSchema;
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

// Validation pour les tags
const validateTag = createValidationMiddleware(
	tagSchema,
	"TAG_VALIDATION_ERROR",
);

// Validation pour les noms de fichiers
const validateFilename = (req, res, next) => {
	try {
		const validatedParams = filenameSchema.parse(req.params);
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

// Validation pour les utilisateurs
const validateUser = createValidationMiddleware(
	userSchema,
	"USER_VALIDATION_ERROR",
);

// Validation pour la modification d'utilisateurs
const validateUserUpdate = createValidationMiddleware(
	userUpdateSchema,
	"USER_UPDATE_VALIDATION_ERROR",
);

// Validation pour le changement de mot de passe
const validatePasswordChange = createValidationMiddleware(
	passwordChangeSchema,
	"PASSWORD_CHANGE_VALIDATION_ERROR",
);

// =================================================================
// EXPORTS FINAUX
// =================================================================

module.exports = {
	// Middleware de validation
	validatePagination,
	validateId,
	validateSlug,
	validateContact,
	validateLogin,
	validateArticle,
	validateIllustration,
	validateAbout,
	validateTag,
	validateFilename,
	validateUser,
	validateUserUpdate,
	validatePasswordChange,

	// Schémas (pour usage avancé)
	schemas: {
		pagination: paginationSchema,
		id: idSchema,
		slug: slugSchema,
		contact: contactSchema,
		login: loginSchema,
		article: articleSchema,
		illustration: illustrationSchema,
		about: aboutSchema,
		aboutContent: aboutContentSchema,
		aboutImage: aboutImageSchema,
		tag: tagSchema,
		filename: filenameSchema,
		user: userSchema,
		userUpdate: userUpdateSchema,
		passwordChange: passwordChangeSchema,
	},
};
