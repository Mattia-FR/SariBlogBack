import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import usersModel from "../model/usersModel";
import argon2 from "argon2";
import type { User } from "../types/users";
import type { TokenPayload } from "../types/auth";
import { argon2Options } from "../config/argon2";

export async function login(req: Request, res: Response) {
	try {
		const { identifier, password } = req.body;
		if (!identifier || !password) {
			return res.sendStatus(400);
		}

		// Vérifier les secrets AVANT toute opération
		const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
		const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
		if (!ACCESS_SECRET || !REFRESH_SECRET) {
			console.error("JWT secrets non définis");
			return res.sendStatus(500);
		}

		// 1. Récupération de l'utilisateur par email OU username
		const user = await usersModel.findByIdentifier(identifier);
		if (!user) {
			return res.sendStatus(401);
		}

		// 2. Vérification du mot de passe (argon2)
		const isValid = await argon2.verify(user.password, password);
		if (!isValid) {
			return res.sendStatus(401);
		}

		// 3. Création ACCESS TOKEN
		const accessToken = jwt.sign(
			{ userId: user.id, role: user.role },
			ACCESS_SECRET,
			{ expiresIn: "15m" },
		);

		// 4. Création REFRESH TOKEN
		const refreshToken = jwt.sign(
			{ userId: user.id, role: user.role },
			REFRESH_SECRET,
			{ expiresIn: "7d" },
		);

		// 5. Stockage du refresh token en DB
		await usersModel.saveRefreshToken(user.id, refreshToken);

		// 6. Envoi cookie httpOnly
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		// 7. Construction du User (sans password)
		const { password: _, ...userWithoutPassword } = user;
		const publicUser: User = userWithoutPassword;

		// 8. Réponse
		res.json({
			accessToken,
			user: publicUser,
		});
	} catch (err) {
		console.error("Erreur lors de la connexion :", err);
		res.sendStatus(500);
	}
}

export async function refresh(req: Request, res: Response) {
	try {
		// 1. Lire le refresh token depuis le cookie
		const refreshToken = req.cookies?.refreshToken;
		if (!refreshToken) {
			return res.sendStatus(401);
		}

		// 2. Vérifier que les secrets existent
		const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
		const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
		const ACCESS_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
			"15m") as jwt.SignOptions["expiresIn"];

		if (!REFRESH_SECRET || !ACCESS_SECRET) {
			console.error("JWT secrets non définis");
			return res.sendStatus(500);
		}

		// 3. Vérifier et décoder le refresh token
		const payload = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;

		// Validation du payload
		if (!payload.userId || !payload.role) {
			return res.sendStatus(401);
		}

		// 4. Vérifier que le token est toujours valide en DB
		const user = await usersModel.findByIdWithRefreshToken(payload.userId);
		if (!user || user.refresh_token !== refreshToken) {
			return res.sendStatus(401);
		}

		// 5. Générer un NOUVEL access token
		const newAccessToken = jwt.sign(
			{
				userId: payload.userId,
				role: payload.role,
			},
			ACCESS_SECRET,
			{ expiresIn: ACCESS_EXPIRES_IN },
		);

		// 6. Renvoyer le nouvel access token
		res.status(200).json({
			accessToken: newAccessToken,
		});
	} catch (err) {
		// Token invalide, expiré, ou erreur DB
		if (
			err instanceof jwt.JsonWebTokenError ||
			err instanceof jwt.TokenExpiredError
		) {
			return res.sendStatus(401);
		}
		console.error("Erreur lors du refresh:", err);
		return res.sendStatus(500);
	}
}

export async function signup(req: Request, res: Response) {
	try {
		const { username, email, password, firstname, lastname } = req.body;

		// Validation des champs obligatoires
		if (!username || !email || !password) {
			return res
				.status(400)
				.json({ error: "Username, email et password sont requis" });
		}

		// Vérifier les secrets AVANT toute opération
		const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
		const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
		if (!ACCESS_SECRET || !REFRESH_SECRET) {
			console.error("JWT secrets non définis");
			return res.sendStatus(500);
		}

		// 1. Hasher le password avec Argon2
		const hashedPassword = await argon2.hash(password, argon2Options);

		// 2. Créer l'utilisateur (le model vérifie déjà email/username unique)
		try {
			const newUser = await usersModel.create({
				username,
				email,
				password: hashedPassword,
				firstname: firstname || null,
				lastname: lastname || null,
				role: "subscriber", // Par défaut, nouveau compte = subscriber
			});

			// 3. Auto-login après inscription (créer les tokens)
			const accessToken = jwt.sign(
				{ userId: newUser.id, role: newUser.role },
				ACCESS_SECRET,
				{ expiresIn: "15m" },
			);

			const refreshToken = jwt.sign(
				{ userId: newUser.id, role: newUser.role },
				REFRESH_SECRET,
				{ expiresIn: "7d" },
			);

			// 4. Stockage du refresh token en DB
			await usersModel.saveRefreshToken(newUser.id, refreshToken);

			// 5. Envoi cookie httpOnly
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});

			// 6. Réponse avec tokens et user
			res.status(201).json({
				accessToken,
				user: newUser,
			});
		} catch (err) {
			// Gestion des erreurs de duplication
			if (err instanceof Error) {
				if (err.message === "EMAIL_EXISTS") {
					return res.status(409).json({ error: "Cet email est déjà utilisé" });
				}
				if (err.message === "USERNAME_EXISTS") {
					return res
						.status(409)
						.json({ error: "Ce nom d'utilisateur est déjà utilisé" });
				}
			}
			throw err; // Relancer les autres erreurs
		}
	} catch (err) {
		console.error("Erreur lors de l'inscription :", err);
		return res.sendStatus(500);
	}
}

export async function logout(req: Request, res: Response) {
	try {
		// 1. Lire le refresh token depuis le cookie
		const refreshToken = req.cookies?.refreshToken;

		if (!refreshToken) {
			// Pas de token = déjà déconnecté, retourner 200 quand même
			return res.sendStatus(200);
		}

		// 2. Décoder le token pour obtenir l'userId
		const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
		if (!REFRESH_SECRET) {
			console.error("REFRESH_TOKEN_SECRET non défini");
			return res.sendStatus(500);
		}

		try {
			const payload = jwt.verify(refreshToken, REFRESH_SECRET) as TokenPayload;

			// 3. Supprimer le refresh token de la DB
			await usersModel.deleteRefreshToken(payload.userId);
		} catch (err) {
			// Token invalide/expiré, mais on supprime quand même le cookie
			// Pas besoin de vérifier en DB si le token est déjà invalide
		}

		// 4. Supprimer le cookie (en le remettant avec expiration passée)
		res.cookie("refreshToken", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 0, // Expire immédiatement
		});

		// 5. Réponse
		return res.sendStatus(200);
	} catch (err) {
		console.error("Erreur lors de la déconnexion :", err);
		return res.sendStatus(500);
	}
}
