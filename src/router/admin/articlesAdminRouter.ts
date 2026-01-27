import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/articlesAdminController";

const router: Router = express.Router();

// Liste tous les articles (tous statuts)
// GET /admin/articles
router.get("/", browseAll);

// Article par ID avec détails complets
// GET /admin/articles/:id
router.get("/:id", readById);

// Coté admin :
router.post("/", add); // Créer
router.patch("/:id", edit); // Modifier
router.delete("/:id", destroy); // Supprimer

export default router;
