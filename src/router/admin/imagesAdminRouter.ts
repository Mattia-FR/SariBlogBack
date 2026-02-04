import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/imagesAdminController";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireEditor } from "../../middleware/roleMiddleware";

const router: Router = express.Router();

// GET /admin/images — liste toutes les images
router.get("/", requireAuth, requireEditor, browseAll);
// GET /admin/images/:id — détail d'une image
router.get("/:id", requireAuth, requireEditor, readById);
// POST /admin/images — créer une image
router.post("/", requireAuth, requireEditor, add);
// PATCH /admin/images/:id — modifier une image
router.patch("/:id", requireAuth, requireEditor, edit);
// DELETE /admin/images/:id — supprimer une image
router.delete("/:id", requireAuth, requireEditor, destroy);

export default router;
