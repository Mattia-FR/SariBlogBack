import express, { type Router } from "express";
import {
	browseUsedOnPublishedArticles,
	readByArticleId,
	readByImageId,
	readUsedOnGalleryByCategoryId,
} from "../controller/tagsController";

const router: Router = express.Router();

// Avant /article/:id pour ne pas confondre avec un segment dynamique
router.get("/published-articles", browseUsedOnPublishedArticles);
router.get("/category/:categoryId", readUsedOnGalleryByCategoryId);

// Route pour récupérer les tags d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Route pour récupérer les tags d'une image (public)
router.get("/image/:imageId", readByImageId);

export default router;
