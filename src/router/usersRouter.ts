import express, { type Router } from "express";
import { browseAll, readById } from "../controller/usersController";

const router: Router = express.Router();

// Route pour récupérer un utilisateur par son ID (public)
router.get("/:id", readById);

// Route pour lister tous les utilisateurs (public)
router.get("/", browseAll);

export default router;
