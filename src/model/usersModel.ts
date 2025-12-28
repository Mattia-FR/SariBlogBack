import pool from "./db";
// RowDataPacket est un type de mysql2 qui représente une ligne de résultat d'une requête SELECT.
// C'est un type vide (marker type) qui marque les objets retournés par les requêtes de sélection.
import type {
	User,
	UserRow,
	UserRowFromQuery,
	UserWithPassword,
	UserUpdateData,
	UserCreateData,
} from "../types/users";
import type { ResultSetHeader } from "mysql2/promise";

// Récupère tous les utilisateurs de la base de données, sans exposer le password.
// Utilisé pour les listes publiques ou les pages d'administration.
// Retourne un tableau de User (sans password) pour la sécurité.
const findAll = async (): Promise<User[]> => {
	try {
		const [users] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, bio_short, created_at, updated_at 
      FROM users`,
		);
		return users;
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les utilisateurs :", err);
		throw err;
	}
};

// Récupère un utilisateur par son ID, sans exposer le password.
// Utilisé pour afficher les profils utilisateurs publiquement.
// Retourne User | null (sans password) pour la sécurité.
const findById = async (id: number): Promise<User | null> => {
	try {
		const [users] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, bio_short, created_at, updated_at 
      FROM users 
      WHERE id = ?`,
			[id],
		);
		return users[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'utilisateur par ID :", err);
		throw err;
	}
};

// Récupère un utilisateur par son email, INCLUANT le password.
// Utilisé uniquement pour l'authentification (login/vérification de mot de passe).
// Retourne UserWithPassword | null car le password est nécessaire pour vérifier les credentials.
// ATTENTION : Cette fonction doit être utilisée uniquement dans un contexte d'authentification sécurisé.
const findByEmail = async (email: string): Promise<UserWithPassword | null> => {
	try {
		const [users] = await pool.query<UserRow[]>(
			"SELECT * FROM users WHERE email = ?",
			[email],
		);
		return users[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'utilisateur par email :", err);
		throw err;
	}
};

// Met à jour les données d'un utilisateur (sauf le password).
// Utilisé pour modifier le profil utilisateur (bio, email, etc.).
// Permet des mises à jour partielles : seuls les champs fournis dans 'data' sont modifiés.
// Retourne l'utilisateur mis à jour (sans password) ou null si l'utilisateur n'existe pas.
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
		throw new Error("No fields to update");
	}

	// Construit la partie SET de la requête SQL dynamiquement
	// Transforme ["bio", "username"] en "bio = ?, username = ?"
	const fields = keys.map((k) => `${k} = ?`).join(", ");
	values.push(id);

	await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
	return findById(id);
};

// Met à jour le mot de passe d'un utilisateur.
// Utilisé pour le changement de mot de passe (profil utilisateur ou réinitialisation).
// ATTENTION : Le password doit être hashé (Argon2) AVANT d'appeler cette fonction.
// Retourne true si le password a été modifié, false si l'utilisateur n'existe pas.
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

// Crée un nouvel utilisateur dans la base de données.
// Utilisé pour l'inscription et la création de comptes utilisateurs.
// Vérifie que l'email et le username ne sont pas déjà utilisés avant l'insertion.
// Le password doit être hashé (Argon2) AVANT d'appeler cette fonction.
// Retourne l'utilisateur créé (sans password) ou lance une erreur EMAIL_EXISTS/USERNAME_EXISTS.
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
			throw new Error("Failed to retrieve created user");
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

// Supprime un utilisateur de la base de données par son ID.
// Utilisé pour la suppression de comptes utilisateurs.
// Retourne true si l'utilisateur a été supprimé, false s'il n'existait pas.
const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM users WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		if (err instanceof Error) {
			console.error("Erreur lors de la suppression de l'utilisateur :", err.message);
		}
		throw err;
	}
};

const findArtist = async (): Promise<User | null> => {
	try {
		const [users] = await pool.query<UserRowFromQuery[]>(
			`SELECT id, username, email, firstname, lastname, role,
			        avatar, bio, bio_short, created_at, updated_at
			 FROM users
			 WHERE role = 'editor'
			 ORDER BY id ASC
			 LIMIT 1`,
		);

		return users[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'artiste :", err);
		throw err;
	}
};


export default {
	findAll,
	findById,
	findByEmail,
	findArtist,
	updateData,
	updatePassword,
	create,
	deleteOne,
};
