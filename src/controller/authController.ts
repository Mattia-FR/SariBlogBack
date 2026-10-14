import argon2 from "argon2";
import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import usersModel from "../model/usersModel";
import type { TokenPayload } from "../types/auth";
import type { User } from "../types/users";
import { hashRefreshToken } from "../utils/hashRefreshToken";
import { HttpError } from "../utils/httpErrors";

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "strict",
};
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const ACCESS_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
	"15m") as jwt.SignOptions["expiresIn"];
const REFRESH_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN ||
	"7d") as jwt.SignOptions["expiresIn"];

/** Erreur de configuration serveur : 500 journalisé par errorHandler, jamais exposé au client. */
function getSecrets(): { access: string; refresh: string } {
	const access = process.env.ACCESS_TOKEN_SECRET;
	const refresh = process.env.REFRESH_TOKEN_SECRET;
	if (!access || !refresh) {
		throw new Error("JWT secrets non définis");
	}
	return { access, refresh };
}

function isJwtError(err: unknown): boolean {
	return (
		err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError
	);
}

export async function login(req: Request, res: Response) {
	const { identifier, password } = req.body;
	const secrets = getSecrets();

	// 1. Récupération de l'utilisateur par email OU username
	const user = await usersModel.findByIdentifier(identifier);
	if (!user) {
		throw new HttpError(401, "Identifiants invalides");
	}

	// 2. Vérification du mot de passe (argon2)
	const isValid = await argon2.verify(user.password, password);
	if (!isValid) {
		throw new HttpError(401, "Identifiants invalides");
	}

	// 3. Création ACCESS TOKEN
	const accessToken = jwt.sign(
		{ userId: user.id, role: user.role },
		secrets.access,
		{ expiresIn: ACCESS_EXPIRES_IN },
	);

	// 4. Création REFRESH TOKEN
	const refreshToken = jwt.sign(
		{ userId: user.id, role: user.role },
		secrets.refresh,
		{ expiresIn: REFRESH_EXPIRES_IN },
	);

	// 5. Stockage de l'empreinte du refresh token en DB
	await usersModel.saveRefreshToken(user.id, hashRefreshToken(refreshToken));

	// 6. Envoi cookie httpOnly
	res.cookie("refreshToken", refreshToken, {
		...REFRESH_COOKIE_OPTIONS,
		maxAge: REFRESH_MAX_AGE,
	});

	// 7. Construction du User (sans password)
	const { password: _, ...userWithoutPassword } = user;
	const publicUser: User = userWithoutPassword;

	// 8. Réponse
	res.json({
		accessToken,
		user: publicUser,
	});
}

export async function refresh(req: Request, res: Response) {
	// 1. Lire le refresh token depuis le cookie
	const refreshToken = req.cookies?.refreshToken;
	if (!refreshToken) {
		throw new HttpError(401, "Refresh token manquant");
	}

	// 2. Vérifier que les secrets existent
	const secrets = getSecrets();

	// 3. Vérifier et décoder le refresh token
	let payload: TokenPayload;
	try {
		payload = jwt.verify(refreshToken, secrets.refresh) as TokenPayload;
	} catch (err) {
		if (isJwtError(err)) {
			throw new HttpError(401, "Refresh token invalide ou expiré");
		}
		throw err;
	}

	// Validation du payload
	if (!payload.userId || !payload.role) {
		throw new HttpError(401, "Refresh token invalide");
	}

	// 4. Vérifier que le token est toujours valide en DB
	const user = await usersModel.findByIdWithRefreshToken(payload.userId);
	if (!user || user.refresh_token !== hashRefreshToken(refreshToken)) {
		throw new HttpError(401, "Refresh token invalide");
	}

	// 5. Générer un NOUVEL access token
	const newAccessToken = jwt.sign(
		{ userId: payload.userId, role: payload.role },
		secrets.access,
		{ expiresIn: ACCESS_EXPIRES_IN },
	);

	// 6. Rotation du refresh token (nouveau en DB, ancien invalidé)
	const newRefreshToken = jwt.sign(
		{ userId: payload.userId, role: payload.role },
		secrets.refresh,
		{ expiresIn: REFRESH_EXPIRES_IN },
	);
	await usersModel.saveRefreshToken(
		payload.userId,
		hashRefreshToken(newRefreshToken),
	);
	res.cookie("refreshToken", newRefreshToken, {
		...REFRESH_COOKIE_OPTIONS,
		maxAge: REFRESH_MAX_AGE,
	});

	// 7. Renvoyer le nouvel access token
	res.status(200).json({ accessToken: newAccessToken });
}

export async function logout(req: Request, res: Response) {
	// 1. Lire le refresh token depuis le cookie
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		// Pas de token = déjà déconnecté, retourner 200 quand même
		res.sendStatus(200);
		return;
	}

	// 2. Décoder le token pour obtenir l'userId
	const secrets = getSecrets();

	try {
		const payload = jwt.verify(refreshToken, secrets.refresh) as TokenPayload;
		// 3. Supprimer le refresh token de la DB
		await usersModel.deleteRefreshToken(payload.userId);
	} catch (err) {
		// Token invalide/expiré : rien à révoquer en DB, on efface quand même le cookie
		if (!isJwtError(err)) throw err;
	}

	// 4. Supprimer le cookie (en le remettant avec expiration passée)
	res.cookie("refreshToken", "", { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 });

	// 5. Réponse
	res.sendStatus(200);
}
