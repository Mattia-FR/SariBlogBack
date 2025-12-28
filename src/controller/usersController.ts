import type { Request, Response } from "express";

import usersModel from "../model/usersModel";

import type { User } from "../types/users";

// Liste tous les utilisateurs (public)
// GET /users
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const users: User[] = await usersModel.findAll();
		res.status(200).json(users);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les utilisateurs :", err);
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

		res.status(200).json(user);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'utilisateur par ID :", err);
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

		res.status(200).json(artist);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'artiste :", err);
		res.sendStatus(500);
	}
};

export { browseAll, readById, readArtist };

