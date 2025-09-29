const { z } = require("zod");

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

module.exports = {
	user: userSchema,
	userUpdate: userUpdateSchema,
	passwordChange: passwordChangeSchema,
};
