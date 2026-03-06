import { z } from "zod";

export const loginSchema = z.object({
	identifier: z.string().trim().min(1, "Identifiant requis"),
	password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
	username: z.string().trim().min(1, "Le nom d'utilisateur est requis"),
	email: z.string().min(1, "L'email est requis").pipe(z.email()),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
	firstname: z.string().trim().optional(),
	lastname: z.string().trim().optional(),
});
