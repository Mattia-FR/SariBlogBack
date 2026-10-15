import express, { type Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { requireEditor } from "../middleware/roleMiddleware";
import { HttpError } from "../utils/httpErrors";
import adminRouter from "./admin";
import articlesRouter from "./articlesRouter";
import authRouter from "./authRouter";
import categoriesRouter from "./categoriesRouter";
import commentsRouter from "./commentsRouter";
import imagesRouter from "./imagesRouter";
import messagesRouter from "./messagesRouter";
import tagsRouter from "./tagsRouter";
import usersRouter from "./usersRouter";

const router: Router = express.Router();

// Routes publiques
router.use("/articles", articlesRouter);
router.use("/images", imagesRouter);
router.use("/users", usersRouter);
router.use("/tags", tagsRouter);
router.use("/comments", commentsRouter);
router.use("/messages", messagesRouter);
router.use("/auth", authRouter);
router.use("/categories", categoriesRouter);

// Routes privées
router.use("/admin", requireAuth, requireEditor, adminRouter);

// Toute route /api inconnue répond en JSON (contrat d'erreur) plutôt qu'en HTML Express
router.use((_req, _res, next) => {
	next(new HttpError(404, "Route introuvable", "ROUTE_NOT_FOUND"));
});

export default router;
