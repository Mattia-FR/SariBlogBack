const { z } = require("zod");

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

module.exports = {
	tag: tagSchema,
};
