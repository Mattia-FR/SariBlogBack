const { z } = require("zod");

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

module.exports = {
	filename: filenameSchema,
};
