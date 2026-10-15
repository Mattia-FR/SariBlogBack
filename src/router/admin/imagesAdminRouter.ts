import fs from "node:fs/promises";
import express, {
	type NextFunction,
	type Request,
	type Response,
	type Router,
} from "express";
import { uploadImage } from "../../config/multer";
import {
	add,
	browseAll,
	destroy,
	edit,
	readById,
} from "../../controller/admin/imagesAdminController";
import { validate } from "../../middleware/validateMiddleware";
import {
	imageCreateBodySchema,
	imageUpdateBodySchema,
} from "../../schemas/imageSchemas";

const router: Router = express.Router();

/** Valide le body multipart après multer ; supprime le .tmp si la validation échoue. */
function validateImageCreate(
	req: Request,
	_res: Response,
	next: NextFunction,
): void {
	try {
		req.body = imageCreateBodySchema.parse(req.body);
		next();
	} catch (err) {
		if (req.file?.path) {
			void fs.unlink(req.file.path).catch(() => undefined);
		}
		next(err);
	}
}

// GET /admin/images — liste toutes les images
router.get("/", browseAll);
// GET /admin/images/:id — détail d'une image
router.get("/:id", readById);
// POST /admin/images — créer une image (multer puis Zod sur les champs texte)
router.post("/", uploadImage.single("image"), validateImageCreate, add);
// PATCH /admin/images/:id — modifier une image (métadonnées uniquement, pas de nouvel upload)
router.patch("/:id", validate(imageUpdateBodySchema), edit);
// DELETE /admin/images/:id — supprimer une image
router.delete("/:id", destroy);

export default router;
