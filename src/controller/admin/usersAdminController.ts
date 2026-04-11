import type { Request, Response } from "express";
import argon2 from "argon2";
import type { User } from "../../types/users";
import type { UserUpdateData } from "../../types/users";
import { sendError } from "../../utils/httpErrors";
import { buildImageUrl } from "../../utils/imageUrl";
import usersAdminModel from "../../model/admin/usersAdminModel";
import usersModel from "../../model/usersModel";
import { argon2Options } from "../../config/argon2";
import logger from "../../utils/logger";

/** Enrichit un utilisateur avec l'URL complète de son avatar (User → User avec avatarUrl). */
function enrichUserWithAvatarUrl(user: User): User {
	const avatarUrl = buildImageUrl(user.avatar);
	if (avatarUrl) {
		return { ...user, avatarUrl };
	}
	return user;
}

// Récupère l'utilisateur connecté (req.user fourni par le middleware requireAuth).
// GET /admin/users/me
const readMe = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || !req.user.userId) {
			sendError(res, 401, "Non authentifié");
			return;
		}

		const userId = req.user.userId;
		const user: User | null = await usersModel.findById(userId);

		if (!user) {
			sendError(res, 404, "Utilisateur non trouvé");
			return;
		}

		res.status(200).json(enrichUserWithAvatarUrl(user));
	} catch (error) {
		logger.error(
			"Erreur lors de la récupération de l'utilisateur connecté (admin) :",
			error,
		);
		sendError(res, 500, "Erreur lors de la récupération de l'utilisateur connecté");
	}
};

const updateMeProfile = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || !req.user.userId) {
			sendError(res, 401, "Non authentifié");
			return;
		}

		const userId = req.user.userId;
		const { username, email, firstname, lastname, avatar, bio, bio_short } =
			req.body;

		// PATCH partiel : on n'ajoute que les champs effectivement présents dans le body.
		const data: UserUpdateData = {};
		if (username !== undefined) data.username = username;
		if (email !== undefined) data.email = email;
		if (firstname !== undefined) data.firstname = firstname;
		if (lastname !== undefined) data.lastname = lastname;
		if (avatar !== undefined) data.avatar = avatar;
		if (bio !== undefined) data.bio = bio;
		if (bio_short !== undefined) data.bio_short = bio_short;

		const user = await usersAdminModel.updateMeProfile(userId, data);
		if (!user) {
			sendError(res, 404, "Utilisateur non trouvé");
			return;
		}

		res.status(200).json(enrichUserWithAvatarUrl(user));
	} catch (error) {
		logger.error("Erreur lors de la mise à jour du profil (admin) :", error);
		sendError(res, 500, "Erreur lors de la mise à jour du profil");
	}
};

const updateMePassword = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || !req.user.userId) {
			sendError(res, 401, "Non authentifié");
			return;
		}

		const userId = req.user.userId;
		const { password } = req.body;

		if (typeof password !== "string" || password.trim().length === 0) {
			sendError(res, 400, "Mot de passe invalide");
			return;
		}

		const hashedPassword = await argon2.hash(password, argon2Options);
		const success = await usersAdminModel.updateMePassword(
			userId,
			hashedPassword,
		);
		if (success === false) {
			sendError(res, 404, "Utilisateur non trouvé");
			return;
		}

		res.sendStatus(204);
	} catch (error) {
		logger.error(
			"Erreur lors de la mise à jour du mot de passe (admin) :",
			error,
		);
		sendError(res, 500, "Erreur lors de la mise à jour du mot de passe");
	}
};

export { readMe, updateMeProfile, updateMePassword };
