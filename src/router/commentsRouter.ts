import express, { type Router } from "express";
import { commentsLimiter } from "../config/rateLimit";
import { create, readByArticleId } from "../controller/commentsController";
import { validate } from "../middleware/validateMiddleware";
import { commentCreateSchema } from "../schemas/commentSchemas";

const router: Router = express.Router();

// Route pour récupérer les commentaires approuvés d'un article (public)
router.get("/article/:articleId", readByArticleId);

// Créer un commentaire (public, modération via admin)
router.post("/", validate(commentCreateSchema), commentsLimiter, create);

export default router;
