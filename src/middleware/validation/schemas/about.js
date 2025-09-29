const { z } = require("zod");

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

module.exports = {
	about: aboutSchema,
	aboutContent: aboutContentSchema,
	aboutImage: aboutImageSchema,
};
