const { z } = require("zod");
const schemas = require("../schemas");

// =================================================================
// MIDDLEWARE DE VALIDATION SPÉCIALISÉS
// =================================================================

// Middleware de validation des paramètres de pagination
const validatePagination = (req, res, next) => {
	try {
		const validatedQuery = schemas.pagination.parse(req.query);
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
		const validatedParams = schemas.id.parse(req.params);
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
		const validatedParams = schemas.slug.parse(req.params);
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

module.exports = {
	validatePagination,
	validateId,
	validateSlug,
};
