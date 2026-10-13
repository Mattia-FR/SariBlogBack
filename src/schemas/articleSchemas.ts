import { z } from "zod";
import { idListSchema, nullablePositiveIdSchema } from "./common";

const articleStatusSchema = z.enum(["draft", "published", "archived"], {
	error: "Statut invalide (attendu : draft, published, archived)",
});

export const articleCreateSchema = z.object({
	title: z.string().trim().min(1, "Le titre est requis"),
	slug: z.string().trim().optional(),
	content: z.string().default(""),
	excerpt: z.string().nullable().optional(),
	status: articleStatusSchema.optional(),
	featured_image_id: nullablePositiveIdSchema.optional(),
	published_at: z.string().nullable().optional(),
	tag_ids: idListSchema.optional(),
});

export const articleUpdateSchema = z.object({
	title: z.string().trim().min(1, "Le titre ne peut pas être vide").optional(),
	slug: z.string().trim().optional(),
	content: z.string().optional(),
	excerpt: z.string().nullable().optional(),
	status: articleStatusSchema.optional(),
	featured_image_id: nullablePositiveIdSchema.optional(),
	published_at: z.string().nullable().optional(),
	tag_ids: idListSchema.optional(),
});
