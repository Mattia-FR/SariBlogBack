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

module.exports = {
	pagination: paginationSchema,
	id: idSchema,
	slug: slugSchema,
};
