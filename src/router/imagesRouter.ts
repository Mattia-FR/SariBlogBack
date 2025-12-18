import express, { type Router } from "express";
import {
	browseGallery,
	readById,
	readByArticleId,
	readByTag,
	readImageOfTheDay,
} from "../controller/imagesController";

const router: Router = express.Router();

// Route pour l'image du jour (doit être avant /:id pour éviter les conflits)
router.get("/image-of-the-day", readImageOfTheDay);

// Route pour la galerie d'images (public)
router.get("/gallery", browseGallery);

// Route pour récupérer les images d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Route pour récupérer les images par tag (public)
router.get("/tag/:tagId", readByTag);

// Route pour récupérer une image par son ID (public)
// ⚠️ Doit être en dernier car /:id est générique et intercepterait /article/... et /tag/...
router.get("/:id", readById);

export default router;
