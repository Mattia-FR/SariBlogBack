import argon2 from "argon2";
import type { Request, Response } from "express";
import { argon2Options } from "../../config/argon2";
import usersAdminModel from "../../model/admin/usersAdminModel";
import usersModel from "../../model/usersModel";
import type { User } from "../../types/users";
import type { UserUpdateData } from "../../types/users";
import { HttpError } from "../../utils/httpErrors";
import { buildImageUrl } from "../../utils/imageUrl";

/** Enrichit un utilisateur avec l'URL complète de son avatar (User → User avec avatarUrl). */
function enrichUserWithAvatarUrl(user: User): User {
	const avatarUrl = buildImageUrl(user.avatar);
	if (avatarUrl) {
		return { ...user, avatarUrl };
	}
	return user;
}

function requireUserId(req: Request): number {
	if (!req.user || !req.user.userId) {
		throw new HttpError(401, "Non authentifié");
	}
	return req.user.userId;
}

// Récupère l'utilisateur connecté (req.user fourni par le middleware requireAuth).
// GET /admin/users/me
const readMe = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const user: User | null = await usersModel.findById(userId);

	if (!user) {
		throw new HttpError(404, "Utilisateur non trouvé");
	}

	res.status(200).json(enrichUserWithAvatarUrl(user));
};

const updateMeProfile = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
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
		throw new HttpError(404, "Utilisateur non trouvé");
	}

	res.status(200).json(enrichUserWithAvatarUrl(user));
};

const updateMePassword = async (req: Request, res: Response): Promise<void> => {
	const userId = requireUserId(req);
	const { currentPassword, password } = req.body;

	const user = await usersModel.findByIdWithPassword(userId);
	if (!user) {
		throw new HttpError(404, "Utilisateur non trouvé");
	}

	const isValid = await argon2.verify(user.password, currentPassword);
	if (!isValid) {
		throw new HttpError(400, "Mot de passe actuel incorrect");
	}

	const hashedPassword = await argon2.hash(password, argon2Options);
	const success = await usersAdminModel.updateMePassword(
		userId,
		hashedPassword,
	);
	if (success === false) {
		throw new HttpError(404, "Utilisateur non trouvé");
	}

	await usersModel.deleteRefreshToken(userId);

	res.cookie("refreshToken", "", {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 0,
	});

	res.sendStatus(204);
};

export { readMe, updateMeProfile, updateMePassword };
