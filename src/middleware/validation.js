const { z } = require("zod");

// =================================================================
// SCHÉMAS DE BASE - SIMPLIFIÉS
// =================================================================

// Schéma de pagination
const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(50).default(10),
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
			/^[a-z09-]+$/,
			"Slug must contain only lowercase letters, numbers and hyphens",
		),
});

// =================================================================
// SCHÉMAS DE DONNÉES - SIMPLIFIÉS
// =================================================================

// Schéma pour les messages de contact
const contactSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email("Invalid email format"),
	subject: z.string().max(150).optional().default(""),
	message: z.string().min(10).max(1000),
});

// =================================================================
// MIDDLEWARE DE VALIDATION - SIMPLIFIÉS
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

// Middleware de validation des données de contact
const validateContact = (req, res, next) => {
	try {
		const validatedData = contactSchema.parse(req.body);
		req.body = validatedData;
		next();
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res.status(400).json({
				success: false,
				error: {
					code: "VALIDATION_ERROR",
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

// =================================================================
// EXPORTS - SIMPLIFIÉS
// =================================================================

module.exports = {
	// Middleware de validation
	validatePagination,
	validateId,
	validateSlug,
	validateContact,

	// Schémas
	schemas: {
		pagination: paginationSchema,
		id: idSchema,
		slug: slugSchema,
		contact: contactSchema,
	},
};
