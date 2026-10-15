import { z } from "zod";

export const tagCreateSchema = z.object({
	name: z.string().trim().min(1, "Le nom est requis"),
	slug: z.string().trim().optional(),
});

export const tagUpdateSchema = z
	.object({
		name: z.string().trim().optional(),
		slug: z.string().trim().optional(),
	})
	.refine(
		(data) =>
			(data.name !== undefined && data.name !== "") ||
			(data.slug !== undefined && data.slug !== ""),
		{
			message: "Au moins un champ (name ou slug) doit être fourni et non vide",
		},
	);
