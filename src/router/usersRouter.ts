import express, { type Router } from "express";
import { readArtist } from "../controller/usersController";

const router: Router = express.Router();

// Route pour récupérer l'artiste principale (public)
router.get("/artist", readArtist);

export default router;
