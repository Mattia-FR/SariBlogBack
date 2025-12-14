import express, { type Router } from "express";
import {
	browseAll,
	readByArticleId,
	readByImageId,
} from "../controller/tagsController";

const router: Router = express.Router();

// Route pour récupérer les tags d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Route pour récupérer les tags d'une image (public)
router.get("/image/:imageId", readByImageId);

// Route pour lister tous les tags (public)
router.get("/", browseAll);

export default router;
