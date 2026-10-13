import { z } from "zod";

/** Liste d'identifiants positifs, dédupliquée (équivalent de parseIdList). */
export const idListSchema = z
	.array(
		z.coerce
			.number()
			.int()
			.positive("Le champ ne doit contenir que des identifiants valides"),
		{ error: "Le champ doit être une liste" },
	)
	.transform((ids) => [...new Set(ids)]);

/** ID positif, ou null / chaîne vide → null. */
export const nullablePositiveIdSchema = z
	.union([z.coerce.number().int().positive(), z.null(), z.literal("")])
	.transform((value) => (value === "" || value == null ? null : value));
