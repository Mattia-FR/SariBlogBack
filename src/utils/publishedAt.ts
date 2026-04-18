import type { ArticleStatus } from "../types/articles";

/** À la création : brouillon/archivé → pas de date ; publié sans date explicite → maintenant. */
export function publishedAtForCreate(
	status: ArticleStatus,
	explicit: string | null,
): string | null {
	if (status !== "published") {
		return null;
	}
	if (explicit != null && explicit !== "") {
		return String(explicit);
	}
	return new Date().toISOString();
}
