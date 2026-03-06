import { z } from "zod";

export const commentCreateSchema = z.object({
	article_id: z.coerce
		.number()
		.int()
		.positive("L'ID de l'article doit être un entier positif"),
	text: z
		.string()
		.trim()
		.min(1, "Le commentaire ne peut pas être vide")
		.max(2000, "Le commentaire ne doit pas dépasser 2000 caractères"),
});
