import { ALLOWED_IMAGE_MIME } from "../config/imageConstraints";

const allowedMime = new Set<string>(ALLOWED_IMAGE_MIME);

/**
 * Vérifie les magic bytes du fichier (via file-type) contre une whitelist d'images.
 * Throw si le type est absent ou non autorisé.
 */
export async function assertAllowedImageFile(filePath: string): Promise<void> {
	const { fileTypeFromFile } = await import("file-type");
	const type = await fileTypeFromFile(filePath);
	if (!type || !allowedMime.has(type.mime)) {
		throw new Error("Format de fichier non autorisé");
	}
}
