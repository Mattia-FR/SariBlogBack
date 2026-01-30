import express, { type Router } from "express";
import {
	browsePublished,
	readPublishedById,
	readPublishedBySlug,
	readHomepagePreview,
} from "../controller/articlesController";

const router: Router = express.Router();

// ⚠️ ORDRE IMPORTANT : Les routes spécifiques doivent être AVANT les routes génériques

router.get("/homepage-preview", readHomepagePreview);
router.get("/published", browsePublished);

// Chemins distincts pour éviter l'ambiguïté id vs slug :
router.get("/published/id/:id", readPublishedById);
router.get("/published/slug/:slug", readPublishedBySlug);

export default router;
