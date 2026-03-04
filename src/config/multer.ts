import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";

const uploadDir = "./uploads/images";

const storage = multer.diskStorage({
	destination: (_req, _file, callbackMulter) => {
		callbackMulter(null, uploadDir);
	},
	filename: (_req, file, callbackMulter) => {
		const id = crypto.randomUUID();
		const ext = path.extname(file.originalname);
		callbackMulter(null, `${id}${ext}`);
	},
});

export const uploadImage = multer({
	storage,
	limits: { fileSize: 20 * 1024 * 1024 },
	fileFilter: (_req, file, callbackMulter) => {
		if (file.mimetype.startsWith("image/")) {
			callbackMulter(null, true);
		} else {
			callbackMulter(new Error("Le fichier doit être une image"));
		}
	},
});
