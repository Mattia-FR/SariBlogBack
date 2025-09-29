const { z } = require("zod");

// =================================================================
// SCHÉMAS DE DONNÉES PUBLIQUES
// =================================================================

// Schéma pour les messages de contact
const contactSchema = z.object({
	name: z.string().min(2).max(100),
	email: z.string().email("Format d'email invalide"),
	subject: z.string().max(150).optional().default(""),
	message: z.string().min(10).max(1000),
});

module.exports = {
	contact: contactSchema,
};
