import { HttpError } from "./httpErrors";

const MAX_LIMIT = 20;

/** Parse un identifiant d'URL (`req.params.id`, etc.). Lève un 400 s'il n'est pas un entier positif. */
export function parseIdParam(value: unknown, message = "ID invalide"): number {
	const id = Number.parseInt(String(value), 10);
	if (Number.isNaN(id) || id < 1) {
		throw new HttpError(400, message);
	}
	return id;
}

/** Parse un identifiant optionnel de query string (`?tagId=2`). `undefined` si absent ou vide. */
export function parseOptionalIdQuery(
	value: unknown,
	name: string,
): number | undefined {
	if (value === undefined || value === "") return undefined;
	const id = Number.parseInt(String(value), 10);
	if (Number.isNaN(id) || id < 1) {
		throw new HttpError(
			400,
			`Le paramètre ${name} doit être un nombre positif`,
		);
	}
	return id;
}

/** Parse `page` et `limit` (1–20). Absents ou à 0 → valeurs par défaut. */
export function parsePaginationParams(
	query: Record<string, unknown>,
	defaultLimit = 10,
): { page: number; limit: number } {
	const page = Number.parseInt(String(query.page), 10) || 1;
	const limit = Number.parseInt(String(query.limit), 10) || defaultLimit;

	if (page < 1) {
		throw new HttpError(400, "Le paramètre page doit être un nombre positif");
	}
	if (limit < 1 || limit > MAX_LIMIT) {
		throw new HttpError(
			400,
			`Le paramètre limit doit être entre 1 et ${MAX_LIMIT}`,
		);
	}
	return { page, limit };
}

/** Normalise une liste d'identifiants (`tag_ids`) : nombres valides, sans doublon. */
export function parseIdList(value: unknown, name = "tag_ids"): number[] {
	if (!Array.isArray(value)) {
		throw new HttpError(400, `Le champ ${name} doit être une liste`);
	}
	const ids = value.map((id) => Number(id));
	if (ids.some((id) => !Number.isInteger(id) || id < 1)) {
		throw new HttpError(
			400,
			`Le champ ${name} ne doit contenir que des identifiants valides`,
		);
	}
	return [...new Set(ids)];
}
