import crypto from "node:crypto";
import multer from "multer";
import { HttpError } from "../utils/httpErrors";
import { ALLOWED_IMAGE_MIME, MAX_IMAGE_BYTES } from "./imageConstraints";

const uploadDir = "./uploads/images";

const allowedMime = new Set<string>(ALLOWED_IMAGE_MIME);

const storage = multer.diskStorage({
	destination: (_req, _file, callbackMulter) => {
		callbackMulter(null, uploadDir);
	},
	filename: (_req, _file, callbackMulter) => {
		callbackMulter(null, `${crypto.randomUUID()}.tmp`);
	},
});

export const uploadImage = multer({
	storage,
	limits: { fileSize: MAX_IMAGE_BYTES },
	fileFilter: (_req, file, callbackMulter) => {
		if (allowedMime.has(file.mimetype)) {
			callbackMulter(null, true);
		} else {
			callbackMulter(
				new HttpError(
					400,
					"Type de fichier non autorisé (image attendue)",
					"INVALID_FILE_TYPE",
				),
			);
		}
	},
});
