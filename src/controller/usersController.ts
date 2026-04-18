/**
 * Controller des utilisateurs publics.
 * Enrichit les User avec avatarUrl (URL complète de l'avatar) avant envoi.
 */
import type { Request, Response } from "express";
import usersModel from "../model/usersModel";
import type { User } from "../types/users";
import { sendError } from "../utils/httpErrors";
import { buildImageUrl } from "../utils/imageUrl";
import logger from "../utils/logger";

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
const readArtist = async (req: Request, res: Response): Promise<void> => {
	try {
		const artist: User | null = await usersModel.findArtist();

		if (!artist) {
			sendError(res, 404, "Artiste non trouvé");
			return;
		}

		const enrichedArtist = enrichUserWithAvatarUrl(artist);
		res.status(200).json(enrichedArtist);
	} catch (err) {
		logger.error("Erreur lors de la récupération de l'artiste :", err);
		sendError(res, 500, "Erreur lors de la récupération de l'artiste");
	}
};

export { readArtist };
