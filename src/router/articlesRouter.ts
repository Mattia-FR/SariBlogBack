import express, { type Router } from "express";
import {
	browseAll,
	readById,
	readBySlug,
	browsePublished,
	readPublishedBySlug,
	readHomepagePreview,
} from "../controller/articlesController";

const router: Router = express.Router();

// Route pour la preview homepage (doit être avant /published/:slug pour éviter les conflits)
router.get("/homepage-preview", readHomepagePreview);

// Route pour récupérer un article publié par slug (public)
router.get("/published/:slug", readPublishedBySlug);

// Route pour lister tous les articles publiés (public)
router.get("/published", browsePublished);

// Route pour récupérer un article par slug (admin - tous statuts)
router.get("/slug/:slug", readBySlug);

// Route pour récupérer un article par son ID (admin - tous statuts)
router.get("/:id", readById);

// Route pour lister tous les articles (admin - tous statuts)
router.get("/", browseAll);

export default router;

