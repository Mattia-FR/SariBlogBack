import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/articlesAdminController";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/roleMiddleware";

const router: Router = express.Router();

// Liste tous les articles (tous statuts)
// GET /admin/articles
router.get("/", requireAuth, requireRole(["admin", "editor"]), browseAll);

// Article par ID avec détails complets
// GET /admin/articles/:id
router.get("/:id", requireAuth, requireRole(["admin", "editor"]), readById);

// Coté admin :
router.post("/", requireAuth, requireRole(["admin", "editor"]), add); // Créer
router.patch("/:id", requireAuth, requireRole(["admin", "editor"]), edit); // Modifier
router.delete("/:id", requireAuth, requireRole(["admin", "editor"]), destroy); // Supprimer

export default router;
