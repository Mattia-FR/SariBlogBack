import express, { type Router } from "express";
import {
	browseAll,
	browseByStatus,
	readById,
	add,
	editStatus,
	destroy,
} from "../controller/messagesController";
import { optionalAuth } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Route publique pour créer un message (formulaire de contact)
// Le middleware optionalAuth permet de détecter si l'utilisateur est connecté sans bloquer les visiteurs
router.post("/", optionalAuth, add);

// Routes admin (à protéger avec un middleware d'authentification plus tard)
router.get("/", browseAll);
router.get("/status/:status", browseByStatus);
router.get("/:id", readById);
router.patch("/:id/status", editStatus);
router.delete("/:id", destroy);

export default router;
