import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { processUploadedImage } from "../../src/utils/processUploadedImage";

// Sur Windows, le cache Sharp peut garder des handles ouverts et bloquer le unlink.
sharp.cache(false);

describe("processUploadedImage", () => {
	let tempDir: string;
	let inputPath: string;

	beforeEach(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "sariblog-img-"));
		inputPath = path.join(tempDir, "fixture.tmp");
		await sharp({
			create: {
				width: 100,
				height: 80,
				channels: 3,
				background: { r: 40, g: 120, b: 200 },
			},
		})
			.png()
			.toFile(inputPath);
	});

	afterEach(async () => {
		await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
	});

	it("produit un fichier .webp et supprime l'entrée .tmp", async () => {
		const basename = await processUploadedImage(inputPath);

		expect(basename).toBe("fixture.webp");
		expect(basename.endsWith(".webp")).toBe(true);

		const outputPath = path.join(tempDir, basename);
		await expect(fs.access(outputPath)).resolves.toBeUndefined();
		await expect(fs.access(inputPath)).rejects.toMatchObject({
			code: "ENOENT",
		});

		const pipeline = sharp(outputPath);
		const meta = await pipeline.metadata();
		pipeline.destroy();

		expect(meta.format).toBe("webp");
		expect(meta.width).toBe(100);
	});

	it("ne dépasse pas 1920px de large", async () => {
		const widePath = path.join(tempDir, "wide.tmp");
		await sharp({
			create: {
				width: 3000,
				height: 1000,
				channels: 3,
				background: { r: 10, g: 10, b: 10 },
			},
		})
			.png()
			.toFile(widePath);

		const basename = await processUploadedImage(widePath);
		const pipeline = sharp(path.join(tempDir, basename));
		const meta = await pipeline.metadata();
		pipeline.destroy();

		expect(meta.width).toBe(1920);
		expect(meta.format).toBe("webp");
	});
});
