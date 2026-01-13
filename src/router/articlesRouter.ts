import express, { type Router } from "express";
import {
	browseAll,
	readById,
	readBySlug,
	browsePublished,
	readPublishedBySlug,
	readHomepagePreview,
} from "../controller/articlesController";

const router: Router = express.Router();

// ⚠️ ORDRE IMPORTANT : Les routes spécifiques doivent être AVANT les routes génériques
// Sinon "/:id" intercepterait toutes les autres routes

// Route pour lister tous les articles (admin - tous statuts)
// ✅ Doit être en premier car "/" est une route exacte
router.get("/", browseAll);

// Routes spécifiques (doivent être avant /:id et /slug/:slug)
router.get("/homepage-preview", readHomepagePreview);
router.get("/published", browsePublished);

// Routes avec paramètres spécifiques (avant les routes génériques)
router.get("/published/:slug", readPublishedBySlug);
router.get("/slug/:slug", readBySlug);

// Routes génériques (en dernier car elles capturent tout)
// ⚠️ /:id doit être en dernier car il intercepte n'importe quelle chaîne
router.get("/:id", readById);

export default router;

