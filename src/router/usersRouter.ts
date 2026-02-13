import express, { type Router } from "express";
import {
	browseAll,
	readArtist,
	readById,
	readMe,
} from "../controller/usersController";
import { requireAuth } from "../middleware/authMiddleware";

const router: Router = express.Router();

// Route pour lister tous les utilisateurs (public)
router.get("/", browseAll);

// Route pour récupérer l'artiste principale (public)
router.get("/artist", readArtist);

// Route pour récupérer l'utilisateur connecté (protégée)
// ⚠️ Doit être AVANT /:id pour éviter que /:id n'intercepte /me
router.get("/me", requireAuth, readMe);

// Route pour récupérer un utilisateur par son ID (public)
// ⚠️ Doit être après /me pour éviter que /:id n'intercepte la route /me
router.get("/:id", readById);

export default router;
