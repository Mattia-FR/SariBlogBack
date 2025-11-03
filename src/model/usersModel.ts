import pool from "./db";
// RowDataPacket est un type de mysql2 qui représente une ligne de résultat d'une requête SELECT.
// C'est un type vide (marker type) qui marque les objets retournés par les requêtes de sélection.
import type {
	User,
	UserRow,
	UserWithPassword,
	UserUpdateData,
} from "../types/users";

// Récupère tous les utilisateurs de la base de données, sans exposer le password.
// Utilisé pour les listes publiques ou les pages d'administration.
// Retourne un tableau de User (sans password) pour la sécurité.
const findAll = async (): Promise<User[]> => {
	try {
		const [users] = await pool.query<UserRow[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, created_at, updated_at 
      FROM users`,
		);
		return users;
	} catch (err) {
		console.error("Error fetching all users:", err);
		throw err;
	}
};

// Récupère un utilisateur par son ID, sans exposer le password.
// Utilisé pour afficher les profils utilisateurs publiquement.
// Retourne User | null (sans password) pour la sécurité.
const findById = async (id: number): Promise<User | null> => {
	try {
		const [users] = await pool.query<UserRow[]>(
			`SELECT id, username, email, firstname, lastname, role, 
              avatar, bio, created_at, updated_at 
      FROM users 
      WHERE id = ?`,
			[id],
		);
		return users[0] || null;
	} catch (err) {
		console.error("Error fetching user by id:", err);
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
		console.error("Error fetching user by email:", err);
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

export default {
	findAll,
	findById,
	findByEmail,
	updateData,
};
