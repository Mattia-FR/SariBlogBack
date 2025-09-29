const { z } = require("zod");

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

module.exports = {
	article: articleSchema,
};
