import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { assertAllowedImageFile } from "../../src/utils/assertAllowedImageFile";

sharp.cache(false);

describe("assertAllowedImageFile", () => {
	let tempDir: string;

	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sariblog-mime-"));
	});

	afterEach(async () => {
		await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
	});

	it("accepte un PNG valide", async () => {
		const inputPath = path.join(tempDir, "ok.tmp");
		await sharp({
			create: {
				width: 50,
				height: 40,
				channels: 3,
				background: { r: 10, g: 20, b: 30 },
			},
		})
			.png()
			.toFile(inputPath);

		await expect(assertAllowedImageFile(inputPath)).resolves.toBeUndefined();
	});

	it("rejette un fichier texte", async () => {
		const inputPath = path.join(tempDir, "fake.tmp");
		await fs.writeFile(inputPath, "ceci n'est pas une image", "utf8");

		await expect(assertAllowedImageFile(inputPath)).rejects.toThrow(
			"Format de fichier non autorisé",
		);
	});
});
