import express, { type Router } from "express";
import {
	readMe,
	updateMeProfile,
	updateMePassword,
} from "../../controller/admin/usersAdminController";

const router: Router = express.Router();

// GET /admin/users/me — récupérer le profil de l'utilisateur connecté
router.get("/me", readMe);
// PATCH /admin/users/me — modifier le profil de l'utilisateur connecté
router.patch("/me", updateMeProfile);
// PATCH /admin/users/me/password — modifier le mot de passe de l'utilisateur connecté
router.patch("/me/password", updateMePassword);

export default router;
