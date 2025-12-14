import express, { type Router } from "express";
import { browseAll, readById } from "../controller/usersController";

const router: Router = express.Router();

// Route pour lister tous les utilisateurs (public)
router.get("/", browseAll);

// Route pour récupérer un utilisateur par son ID (public)
// ⚠️ Doit être après / pour éviter que /:id n'intercepte la route /
router.get("/:id", readById);

export default router;
