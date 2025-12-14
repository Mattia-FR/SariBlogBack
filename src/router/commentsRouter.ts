import express, { type Router } from "express";
import { readByArticleId } from "../controller/commentsController";

const router: Router = express.Router();

// Route pour récupérer les commentaires approuvés d'un article (public)
router.get("/article/:articleId", readByArticleId);

export default router;
