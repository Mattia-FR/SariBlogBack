import type { Request, Response } from "express";
import argon2 from "argon2";
import type { User } from "../../types/users";
import type { UserUpdateData } from "../../types/users";
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
			res.sendStatus(401);
			return;
		}

		const userId = req.user.userId;
		const user: User | null = await usersModel.findById(userId);

		if (!user) {
			res.sendStatus(404);
			return;
		}

		res.status(200).json(enrichUserWithAvatarUrl(user));
	} catch (error) {
		logger.error(
			"Erreur lors de la récupération de l'utilisateur connecté (admin) :",
			error,
		);
		res.sendStatus(500);
	}
};

const updateMeProfile = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || !req.user.userId) {
			res.sendStatus(401);
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
			res.sendStatus(404);
			return;
		}

		res.status(200).json(enrichUserWithAvatarUrl(user));
	} catch (error) {
		logger.error("Erreur lors de la mise à jour du profil (admin) :", error);
		res.sendStatus(500);
	}
};

const updateMePassword = async (req: Request, res: Response): Promise<void> => {
	try {
		if (!req.user || !req.user.userId) {
			res.sendStatus(401);
			return;
		}

		const userId = req.user.userId;
		const { password } = req.body;

		if (typeof password !== "string" || password.trim().length === 0) {
			res.status(400).json({ error: "Mot de passe invalide" });
			return;
		}

		const hashedPassword = await argon2.hash(password, argon2Options);
		const success = await usersAdminModel.updateMePassword(
			userId,
			hashedPassword,
		);
		if (success === false) {
			res.sendStatus(404);
			return;
		}

		res.sendStatus(204);
	} catch (error) {
		logger.error(
			"Erreur lors de la mise à jour du mot de passe (admin) :",
			error,
		);
		res.sendStatus(500);
	}
};

export { readMe, updateMeProfile, updateMePassword };
