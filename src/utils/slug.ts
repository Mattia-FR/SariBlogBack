import slugify from "slugify";

/**
 * Génère un slug URL-safe à partir d'une chaîne.
 * - minuscules
 * - suppression des accents
 * - suppression des caractères spéciaux
 * - espaces remplacés par des tirets
 *
 * @param value - Texte source (ex. titre d'article)
 */
export function buildSlug(value: string): string {
	return slugify(value, {
		lower: true,
		strict: true,
	});
}
