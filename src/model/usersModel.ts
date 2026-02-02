/**
 * Modèle des utilisateurs.
 * Gère la lecture, création, mise à jour (profil, password), tokens refresh.
 * Convertit les lignes BDD (Date) en User (created_at, updated_at en string).
 */
import pool from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
	User,
	UserWithPassword,
	UserUpdateData,
	UserCreateData,
} from "../types/users";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par SELECT * (avec password).
interface UserRow extends RowDataPacket {
	id: number;
	username: string;
	email: string;
	password: string;
	firstname: string | null;
	lastname: string | null;
	role: "admin" | "editor" | "subscriber";
	avatar: string | null;
	bio: string | null;
	bio_short: string | null;
	created_at: Date;
	updated_at: Date;
}

// Type pour les lignes retournées par SELECT sans password.
interface UserRowFromQuery extends RowDataPacket {
	id: number;
	username: string;
	email: string;
	firstname: string | null;
	lastname: string | null;
	role: "admin" | "editor" | "subscriber";
	avatar: string | null;
	bio: string | null;
	bio_short: string | null;
	created_at: Date;
	updated_at: Date;
}

// ========================================
// HELPERS
// ========================================

/** Convertit une row (sans password) en User (dates string). */
function rowToUser(row: UserRowFromQuery): User {
	return {
		...row,
		created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
		updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
	};
}

/** Convertit une row (avec password) en UserWithPassword (dates string). */
function rowToUserWithPassword(row: UserRow): UserWithPassword {
	return {
		...row,
		created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
		updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
	};
}

// Type pour les lignes retournées par SELECT refresh_token
interface UserRefreshTokenRow extends RowDataPacket {
	refresh_token: string | null;
}

// Récupère tous les utilisateurs sans exposer le password. Retourne User[] (dates string).
const findAll = async (): Promise<User[]> => {
	try {
		const [rows] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, bio_short, created_at, updated_at 
      FROM users`,
		);
		return rows.map(rowToUser);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de tous les utilisateurs :",
			err,
		);
		throw err;
	}
};

// Récupère un utilisateur par ID sans password. Retourne User | null (dates string).
const findById = async (id: number): Promise<User | null> => {
	try {
		const [rows] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, bio_short, created_at, updated_at 
      FROM users 
      WHERE id = ?`,
			[id],
		);
		if (!rows[0]) return null;
		return rowToUser(rows[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur par ID :",
			err,
		);
		throw err;
	}
};

// Récupère un utilisateur par email avec password (auth uniquement). Retourne UserWithPassword | null (dates string).
const findByEmail = async (email: string): Promise<UserWithPassword | null> => {
	try {
		const [rows] = await pool.query<UserRow[]>(
			"SELECT * FROM users WHERE email = ?",
			[email],
		);
		if (!rows[0]) return null;
		return rowToUserWithPassword(rows[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur par email :",
			err,
		);
		throw err;
	}
};

// Récupère un utilisateur par email ou username avec password (auth). Retourne UserWithPassword | null (dates string).
const findByIdentifier = async (identifier: string): Promise<UserWithPassword | null> => {
	try {
		const [rows] = await pool.query<UserRow[]>(
			"SELECT * FROM users WHERE email = ? OR username = ?",
			[identifier, identifier],
		);
		if (!rows[0]) return null;
		return rowToUserWithPassword(rows[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'utilisateur par identifier :",
			err,
		);
		throw err;
	}
};

// Met à jour les données d'un utilisateur (sauf password). Mise à jour partielle. Retourne User | null (dates string).
const updateData = async (
	id: number,
	data: UserUpdateData,
): Promise<User | null> => {
	// Récupère les noms des propriétés de l'objet data (ex: ["bio", "username"])
	const keys = Object.keys(data);

	// Récupère les valeurs correspondantes (ex: ["Hello", "John"])
	const values = Object.values(data);

	// Vérifie qu'il y a au moins un champ à modifier
	if (keys.length === 0) {
		throw new Error("Aucun champ à mettre à jour");
	}

	// Construit la partie SET de la requête SQL dynamiquement
	// Transforme ["bio", "username"] en "bio = ?, username = ?"
	const fields = keys.map((k) => `${k} = ?`).join(", ");
	values.push(id);

	await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
	return findById(id);
};

// Met à jour le mot de passe (doit être hashé Argon2 avant appel). Retourne true si modifié.
const updatePassword = async (
	id: number,
	hashedPassword: string,
): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"UPDATE users SET password = ? WHERE id = ?",
			[hashedPassword, id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error("Erreur lors de la mise à jour du mot de passe :", err);
		throw err;
	}
};

// Crée un nouvel utilisateur. Password doit être hashé (Argon2). Vérifie email/username uniques. Retourne User (dates string) ou lance EMAIL_EXISTS/USERNAME_EXISTS.
const create = async (data: UserCreateData): Promise<User> => {
	try {
		// Vérifier email ET username en une seule requête
		const [existing] = await pool.query<UserRow[]>(
			"SELECT id, email, username FROM users WHERE email = ? OR username = ?",
			[data.email, data.username],
		);

		if (existing.length > 0) {
			const duplicate = existing[0];
			if (duplicate.email === data.email) {
				throw new Error("EMAIL_EXISTS");
			}
			if (duplicate.username === data.username) {
				throw new Error("USERNAME_EXISTS");
			}
		}

		// Insertion
		const [result] = await pool.query<ResultSetHeader>(
			`INSERT INTO users (username, email, password, firstname, lastname, role, avatar, bio, bio_short)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				data.username,
				data.email,
				data.password,
				data.firstname ?? null,
				data.lastname ?? null,
				data.role ?? "subscriber",
				data.avatar ?? null,
				data.bio ?? null,
				data.bio_short ?? null,
			],
		);

		const newUser = await findById(result.insertId);
		if (!newUser) {
			throw new Error("Impossible de récupérer l'utilisateur créé");
		}
		return newUser;
	} catch (err) {
		// Si c'est déjà une erreur custom (EMAIL_EXISTS, USERNAME_EXISTS), on la relance
		if (
			err instanceof Error &&
			(err.message === "EMAIL_EXISTS" || err.message === "USERNAME_EXISTS")
		) {
			throw err;
		}

		// Sinon, on intercepte les erreurs MySQL (fallback de sécurité)
		// Les contraintes UNIQUE peuvent quand même échouer en cas de race condition
		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			if (err.message.includes("email")) {
				throw new Error("EMAIL_EXISTS");
			}
			if (err.message.includes("username")) {
				throw new Error("USERNAME_EXISTS");
			}
		}

		console.error("Erreur lors de la création de l'utilisateur :", err);
		throw err;
	}
};

// Supprime un utilisateur par ID. Retourne true si supprimé.
const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM users WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		if (err instanceof Error) {
			console.error(
				"Erreur lors de la suppression de l'utilisateur :",
				err.message,
			);
		}
		throw err;
	}
};

// Récupère l'artiste principal (premier utilisateur avec role = 'editor'). Retourne User | null (dates string).
const findArtist = async (): Promise<User | null> => {
	try {
		const [rows] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role,
			        avatar, bio, bio_short, created_at, updated_at
			FROM users
			WHERE role = 'editor'
			ORDER BY id ASC
			LIMIT 1`,
		);

		if (!rows[0]) return null;
		return rowToUser(rows[0]);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'artiste :", err);
		throw err;
	}
};

// Enregistre le refresh token d'un utilisateur (pour auth).
const saveRefreshToken = async (
	userId: number,
	refreshToken: string,
): Promise<void> => {
	try {
		await pool.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
			refreshToken,
			userId,
		]);
	} catch (err) {
		console.error("Erreur lors de la sauvegarde du refresh token :", err);
		throw err;
	}
};

// Récupère le refresh_token d'un utilisateur par ID (pour auth).
const findByIdWithRefreshToken = async (id: number): Promise<{ refresh_token: string | null } | null> => {
	try {
		const [users] = await pool.query<UserRefreshTokenRow[]>(
			"SELECT refresh_token FROM users WHERE id = ?",
			[id],
		);
		return users[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération du refresh token :", err);
		throw err;
	}
};

// Supprime le refresh token d'un utilisateur (logout).
const deleteRefreshToken = async (userId: number): Promise<void> => {
    try {
        await pool.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [userId]);
    } catch (err) {
        console.error("Erreur lors de la suppression du refresh token :", err);
        throw err;
    }
};

export default {
	findAll,
	findById,
	findByEmail,
	findByIdentifier,
	findArtist,
	updateData,
	updatePassword,
	create,
	deleteOne,
	saveRefreshToken,
	findByIdWithRefreshToken,
	deleteRefreshToken,
};
