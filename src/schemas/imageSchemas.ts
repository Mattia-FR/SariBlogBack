import { z } from "zod";
import { idListSchema, nullablePositiveIdSchema } from "./common";

const GALLERY_CATEGORY_REQUIRED =
	"Une catégorie est requise pour une image affichée dans la galerie";

/** `tag_ids` en tableau JSON, ou string JSON (multipart). */
const tagIdsFieldSchema = z.union([
	idListSchema,
	z
		.string()
		.transform((raw, ctx) => {
			try {
				return JSON.parse(raw) as unknown;
			} catch {
				ctx.addIssue({
					code: "custom",
					message: "Le champ tag_ids n'est pas un JSON valide",
				});
				return z.NEVER;
			}
		})
		.pipe(idListSchema),
]);

/** Coerce multipart (`"true"` / `"on"`) ou bool JSON. */
const isInGallerySchema = z
	.union([z.boolean(), z.literal("true"), z.literal("on"), z.literal("false")])
	.transform((value) => value === true || value === "true" || value === "on");

const nullableTrimmed = z
	.string()
	.trim()
	.transform((value) => (value === "" ? null : value))
	.nullable()
	.optional();

export const imageCreateBodySchema = z
	.object({
		title: nullableTrimmed,
		description: nullableTrimmed,
		alt_descr: nullableTrimmed,
		is_in_gallery: isInGallerySchema.optional().default(false),
		tag_ids: tagIdsFieldSchema.optional(),
		article_id: nullablePositiveIdSchema.optional(),
		category_id: nullablePositiveIdSchema.optional(),
	})
	.refine((data) => !data.is_in_gallery || data.category_id != null, {
		message: GALLERY_CATEGORY_REQUIRED,
		path: ["category_id"],
	});

export const imageUpdateBodySchema = z.object({
	title: z.string().trim().nullable().optional(),
	description: z.string().trim().nullable().optional(),
	alt_descr: z.string().trim().nullable().optional(),
	is_in_gallery: z.boolean().optional(),
	tag_ids: tagIdsFieldSchema.optional(),
	article_id: nullablePositiveIdSchema.optional(),
	category_id: nullablePositiveIdSchema.optional(),
});
