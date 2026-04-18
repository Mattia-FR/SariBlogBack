/** Nombre de mots max avant troncature (cartes liste / blog). */
const DEFAULT_MAX_WORDS = 40;

/**
 * Produit un extrait en texte brut : normalise les espaces, tronque après maxWords mots, ajoute … si tronqué.
 */
export function excerptFromPlainText(
	text: string,
	maxWords: number = DEFAULT_MAX_WORDS,
): string | null {
	const normalized = text.trim().replace(/\s+/g, " ");
	if (!normalized) {
		return null;
	}
	const words = normalized.split(" ");
	if (words.length <= maxWords) {
		return normalized;
	}
	return `${words.slice(0, maxWords).join(" ")}…`;
}
