import express, { type Router } from "express";
import {
	browseGallery,
	readById,
	readByArticleId,
	readByTag,
} from "../controller/imagesController";

const router: Router = express.Router();

// Route pour la galerie d'images (public)
router.get("/gallery", browseGallery);

// Route pour récupérer une image par son ID (public)
router.get("/:id", readById);

// Route pour récupérer les images d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Route pour récupérer les images par tag (public)
router.get("/tag/:tagId", readByTag);

export default router;

