import { z } from "zod";

export const messageVisitorSchema = z.object({
	firstname: z.string().trim().min(1, "Le prénom est requis"),
	lastname: z.string().trim().min(1, "Le nom est requis"),
	email: z.string().min(1, "L'email est requis").pipe(z.email()),
	subject: z.string().trim().min(1, "Le sujet est requis"),
	text: z
		.string()
		.trim()
		.min(1, "Le message est requis")
		.max(5000, "Le message ne doit pas dépasser 5000 caractères"),
});
