import express, { type Router } from "express";
import { readByArticleId, create } from "../controller/commentsController";
import { requireAuth } from "../middleware/authMiddleware";
import { commentsLimiter } from "../config/rateLimit";
import { validate } from "../middleware/validateMiddleware";
import { commentCreateSchema } from "../schemas/commentSchemas";

const router: Router = express.Router();

// Route pour récupérer les commentaires approuvés d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Créer un commentaire (authentification requise)
router.post(
	"/",
	validate(commentCreateSchema),
	commentsLimiter,
	requireAuth,
	create,
);

export default router;
