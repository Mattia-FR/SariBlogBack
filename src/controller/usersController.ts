// usersController.ts
import type { Request, Response } from "express";
import usersModel from "../model/usersModel";
import type { User } from "../types/users";

// Configuration de l'URL de base pour les images
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

// Type pour les utilisateurs enrichis avec URL complète
interface UserWithUrl extends User {
	avatarUrl?: string;
}

/**
 * Fonction utilitaire pour enrichir un utilisateur avec l'URL complète de son avatar
 */
function enrichUserWithAvatarUrl(user: User): UserWithUrl {
	if (user.avatar) {
		return {
			...user,
			avatarUrl: `${IMAGE_BASE_URL}${user.avatar}`,
		};
	}
	return user;
}

// Liste tous les utilisateurs (public)
// GET /users
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const users: User[] = await usersModel.findAll();
		const enrichedUsers = users.map(enrichUserWithAvatarUrl);
		res.status(200).json(enrichedUsers);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de tous les utilisateurs :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère un utilisateur par ID (public)
// GET /users/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const userId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(userId)) {
			res.status(400).json({ error: "ID invalide" });
			return;
		}

		const user: User | null = await usersModel.findById(userId);
		if (!user) {
			res.sendStatus(404);
			return;
		}

		const enrichedUser = enrichUserWithAvatarUrl(user);
		res.status(200).json(enrichedUser);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur par ID :",
			err,
		);
		res.sendStatus(500);
	}
};

// Récupère l'artiste principale (public)
// GET /users/artist
const readArtist = async (req: Request, res: Response): Promise<void> => {
	try {
		const artist: User | null = await usersModel.findArtist();

		if (!artist) {
			res.sendStatus(404);
			return;
		}

		const enrichedArtist = enrichUserWithAvatarUrl(artist);
		res.status(200).json(enrichedArtist);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'artiste :", err);
		res.sendStatus(500);
	}
};

// Récupère l'utilisateur connecté (protégé par authentification)
// GET /users/me
// ⚠️ Nécessite le middleware requireAuth qui ajoute req.user
const readMe = async (req: Request, res: Response): Promise<void> => {
	try {
		// req.user est ajouté par le middleware requireAuth
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

		const enrichedUser = enrichUserWithAvatarUrl(user);
		res.status(200).json(enrichedUser);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur connecté :",
			err,
		);
		res.sendStatus(500);
	}
};

export { browseAll, readById, readArtist, readMe };
