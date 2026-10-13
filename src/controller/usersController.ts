/**
 * Controller des utilisateurs publics.
 * Enrichit les User avec avatarUrl (URL complète de l'avatar) avant envoi.
 */
import type { Request, Response } from "express";
import usersModel from "../model/usersModel";
import type { User } from "../types/users";
import { HttpError } from "../utils/httpErrors";
import { buildImageUrl } from "../utils/imageUrl";

/** Enrichit un utilisateur avec l'URL complète de son avatar (User → User avec avatarUrl). */
function enrichUserWithAvatarUrl(user: User): User {
	const avatarUrl = buildImageUrl(user.avatar);
	if (avatarUrl) {
		return { ...user, avatarUrl };
	}
	return user;
}

// Récupère l'artiste principal (premier utilisateur avec role = 'editor'). Retourne User avec avatarUrl.
// GET /users/artist
const readArtist = async (_req: Request, res: Response): Promise<void> => {
	const artist: User | null = await usersModel.findArtist();
	if (!artist) {
		throw new HttpError(404, "Artiste non trouvé");
	}
	res.status(200).json(enrichUserWithAvatarUrl(artist));
};

export { readArtist };
