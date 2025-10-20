const { z } = require("zod");

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

module.exports = {
	illustration: illustrationSchema,
};
