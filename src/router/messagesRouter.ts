import express, { type Router } from "express";
import {
	browseAll,
	browseByStatus,
	readById,
	add,
	editStatus,
	destroy,
} from "../controller/messagesController";

const router: Router = express.Router();

// Route publique pour créer un message (formulaire de contact)
router.post("/", add);

// Routes admin (à protéger avec un middleware d'authentification plus tard)
router.get("/", browseAll);
router.get("/status/:status", browseByStatus);
router.get("/:id", readById);
router.patch("/:id/status", editStatus);
router.delete("/:id", destroy);

export default router;
