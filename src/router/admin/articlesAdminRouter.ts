import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/articlesAdminController";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireEditor } from "../../middleware/roleMiddleware";
import { readBySlug } from "../../controller/articlesController";

const router: Router = express.Router();

// Liste tous les articles (tous statuts)
// GET /admin/articles
router.get("/", requireAuth, requireEditor, browseAll);

// Article par slug
// GET /admin/articles/slug/:slug
router.get("/slug/:slug", requireAuth, requireEditor, readBySlug);

// Article par ID avec détails complets
// GET /admin/articles/:id
router.get("/:id", requireAuth, requireEditor, readById);

// CRUD :
router.post("/", requireAuth, requireEditor, add); // Créer
router.patch("/:id", requireAuth, requireEditor, edit); // Modifier
router.delete("/:id", requireAuth, requireEditor, destroy); // Supprimer

export default router;
