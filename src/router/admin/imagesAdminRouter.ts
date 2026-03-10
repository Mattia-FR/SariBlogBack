import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/imagesAdminController";
import { uploadImage } from "../../config/multer";

const router: Router = express.Router();

// GET /admin/images — liste toutes les images
router.get("/", browseAll);
// GET /admin/images/:id — détail d'une image
router.get("/:id", readById);
// POST /admin/images — créer une image
router.post("/", uploadImage.single("image"), add);
// PATCH /admin/images/:id — modifier une image (métadonnées uniquement, pas de nouvel upload)
router.patch("/:id", edit);
// DELETE /admin/images/:id — supprimer une image
router.delete("/:id", destroy);

export default router;
