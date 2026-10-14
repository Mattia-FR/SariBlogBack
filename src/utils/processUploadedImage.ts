import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_WIDTH = 1920;
const THUMB_MAX_WIDTH = 400;
const WEBP_QUALITY = 80;

/**
 * Traite un fichier image écrit par Multer : orientation EXIF, redimensionnement
 * (largeur max 1920px sans agrandissement), conversion WebP, et miniature
 * (`<base>-thumb.webp`, max 400px).
 * Supprime le fichier d'entrée si le chemin de sortie diffère.
 *
 * @param inputPath - Chemin absolu ou relatif du fichier temporaire Multer
 * @returns Basename du fichier WebP plein format (ex. "a1b2c3….webp")
 */
export async function processUploadedImage(inputPath: string): Promise<string> {
	const dir = path.dirname(inputPath);
	const base = path.parse(inputPath).name;
	const outputPath = path.join(dir, `${base}.webp`);
	const thumbPath = path.join(dir, `${base}-thumb.webp`);

	const pipeline = sharp(inputPath).rotate();

	await Promise.all([
		pipeline
			.clone()
			.resize({ width: MAX_WIDTH, withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY })
			.toFile(outputPath),
		pipeline
			.clone()
			.resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
			.webp({ quality: WEBP_QUALITY })
			.toFile(thumbPath),
	]);

	if (outputPath !== inputPath) {
		try {
			await fs.unlink(inputPath);
		} catch (err) {
			const code = (err as NodeJS.ErrnoException)?.code;
			if (code !== "ENOENT") {
				throw err;
			}
		}
	}

	return path.basename(outputPath);
}
