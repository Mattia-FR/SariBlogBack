import express, { type Router } from "express";
import {
	add,
	browseAll,
	destroy,
	edit,
	readById,
	readBySlug,
} from "../../controller/admin/articlesAdminController";

const router: Router = express.Router();

// Liste tous les articles (tous statuts)
// GET /admin/articles
router.get("/", browseAll);

// Article par slug
// GET /admin/articles/slug/:slug
router.get("/slug/:slug", readBySlug);

// Article par ID avec détails complets
// GET /admin/articles/:id
router.get("/:id", readById);

// CRUD :
router.post("/", add); // Créer
router.patch("/:id", edit); // Modifier
router.delete("/:id", destroy); // Supprimer

export default router;
