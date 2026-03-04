import express, { type Router } from "express";
import { add } from "../controller/messagesController";
import { optionalAuth } from "../middleware/authMiddleware";
import { messagesLimiter } from "../config/rateLimit";

const router: Router = express.Router();

// Route publique pour créer un message (formulaire de contact)
// Le middleware optionalAuth permet de détecter si l'utilisateur est connecté sans bloquer les visiteurs
router.post("/", messagesLimiter, optionalAuth, add);

export default router;
