import express, { type Router } from "express";
import { readByArticleId, create } from "../controller/commentsController";
import { requireAuth } from "../middleware/authMiddleware";
import { commentsLimiter } from "../config/rateLimit";

const router: Router = express.Router();

// Route pour récupérer les commentaires approuvés d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Créer un commentaire (authentification requise)
router.post("/", commentsLimiter, requireAuth, create);

export default router;
