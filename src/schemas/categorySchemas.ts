import { z } from "zod";

export const categoryCreateSchema = z.object({
	name: z.string().trim().min(1, "Le nom est requis"),
	slug: z.string().trim().optional(),
	display_order: z.number().int("display_order doit être un entier").optional(),
});

export const categoryUpdateSchema = z
	.object({
		name: z.string().trim().optional(),
		slug: z.string().trim().optional(),
		display_order: z
			.number()
			.int("display_order doit être un entier")
			.optional(),
	})
	.refine(
		(data) =>
			(data.name !== undefined && data.name !== "") ||
			(data.slug !== undefined && data.slug !== "") ||
			data.display_order !== undefined,
		{
			message:
				"Au moins un champ (name, slug ou display_order) doit être fourni et valide",
		},
	);
