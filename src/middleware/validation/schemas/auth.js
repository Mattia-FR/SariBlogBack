const { z } = require("zod");

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

module.exports = {
	login: loginSchema,
};
