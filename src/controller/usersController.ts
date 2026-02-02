/**
 * Controller des utilisateurs (lecture publique et /me).
 * Enrichit les User avec avatarUrl (URL complète de l'avatar) avant envoi.
 */
import type { Request, Response } from "express";
import usersModel from "../model/usersModel";
import type { User } from "../types/users";

const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

/** Enrichit un utilisateur avec l'URL complète de son avatar (User → User avec avatarUrl). */
function enrichUserWithAvatarUrl(user: User): User {
	if (user.avatar) {
		return {
			...user,
			avatarUrl: `${IMAGE_BASE_URL}${user.avatar}`,
		};
	}
	return user;
}

// Liste tous les utilisateurs (sans password). Retourne User[] avec avatarUrl.
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

// Récupère un utilisateur par ID (sans password). Retourne User avec avatarUrl.
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

// Récupère l'artiste principal (premier utilisateur avec role = 'editor'). Retourne User avec avatarUrl.
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

// Récupère l'utilisateur connecté (req.user fourni par le middleware requireAuth). Retourne User avec avatarUrl.
// GET /users/me
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
