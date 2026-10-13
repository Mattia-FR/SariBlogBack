import { z } from "zod";

const nullableTrimmedString = (max: number, maxMessage: string) =>
	z.string().trim().max(max, maxMessage).nullable().optional();

const AVATAR_PATH_REGEX = /^\/uploads\/.+\.(jpe?g|png|gif|webp)$/i;

export const updateMeProfileSchema = z.object({
	username: z
		.string()
		.trim()
		.min(1, "Le nom d'utilisateur est requis")
		.max(50, "Le nom d'utilisateur ne doit pas dépasser 50 caractères")
		.refine((value) => !value.includes("@"), {
			message: "Le nom d'utilisateur ne doit pas contenir @",
		})
		.optional(),
	email: z
		.string()
		.trim()
		.min(1, "L'email est requis")
		.max(100, "L'email ne doit pas dépasser 100 caractères")
		.pipe(z.email())
		.optional(),
	firstname: nullableTrimmedString(
		50,
		"Le prénom ne doit pas dépasser 50 caractères",
	),
	lastname: nullableTrimmedString(
		50,
		"Le nom ne doit pas dépasser 50 caractères",
	),
	avatar: nullableTrimmedString(
		255,
		"L'avatar ne doit pas dépasser 255 caractères",
	).refine((value) => value == null || AVATAR_PATH_REGEX.test(value), {
		message:
			"L'avatar doit être un chemin sous /uploads/ avec une extension image (jpg, png, gif, webp)",
	}),
	bio_short: nullableTrimmedString(
		255,
		"La bio courte ne doit pas dépasser 255 caractères",
	),
	bio: z.string().trim().nullable().optional(),
});

export const updateMePasswordSchema = z.object({
	currentPassword: z.string().min(1, "Mot de passe actuel requis"),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});
