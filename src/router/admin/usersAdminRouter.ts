import express, { type Router } from "express";
import {
	readMe,
	updateMePassword,
	updateMeProfile,
} from "../../controller/admin/usersAdminController";
import { validate } from "../../middleware/validateMiddleware";
import {
	updateMePasswordSchema,
	updateMeProfileSchema,
} from "../../schemas/userSchemas";

const router: Router = express.Router();

// GET /admin/users/me — récupérer le profil de l'utilisateur connecté
router.get("/me", readMe);
// PATCH /admin/users/me — modifier le profil de l'utilisateur connecté
router.patch("/me", validate(updateMeProfileSchema), updateMeProfile);
// PATCH /admin/users/me/password — modifier le mot de passe de l'utilisateur connecté
router.patch(
	"/me/password",
	validate(updateMePasswordSchema),
	updateMePassword,
);

export default router;
