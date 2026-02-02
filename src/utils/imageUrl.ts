/**
 * Utilitaire partagé pour construire l'URL complète d'une image ou d'un avatar
 * à partir du path stocké en base (ex. /uploads/images/xxx.jpg).
 * Utilisé par les controllers images, users et articles pour un enrichissement cohérent.
 */

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

/**
 * Retourne l'URL complète (base + path) si path est défini, sinon undefined.
 * Gère les cas base terminant par / et path commençant par / pour éviter le double slash.
 * @param path - Chemin relatif (ex. /uploads/images/xxx.jpg) ou null/undefined
 */
export function buildImageUrl(
	path: string | null | undefined,
): string | undefined {
	if (path == null || path === "") {
		return undefined;
	}
	const base = IMAGE_BASE_URL.replace(/\/$/, "");
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${base}${normalizedPath}`;
}

export { IMAGE_BASE_URL };
