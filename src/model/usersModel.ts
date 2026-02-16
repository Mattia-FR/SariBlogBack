import pool from "./db";
import type { ResultSetHeader } from "mysql2/promise";
import type {
	User,
	UserWithPassword,
	UserUpdateData,
	UserCreateData,
} from "../types/users";
import { toDateString } from "../utils/dateHelpers";

// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.

const findAll = async (): Promise<User[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, username, email, firstname, lastname, role, 
			avatar, bio, bio_short, created_at, updated_at 
			FROM users`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			username: row.username,
			email: row.email,
			firstname: row.firstname,
			lastname: row.lastname,
			role: row.role,
			avatar: row.avatar,
			bio: row.bio,
			bio_short: row.bio_short,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<User | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, username, email, firstname, lastname, role, 
			avatar, bio, bio_short, created_at, updated_at 
			FROM users 
			WHERE id = ?`,
			[id],
		);

		if (!rows[0]) return null;

		const row = rows[0];
		return {
			id: row.id,
			username: row.username,
			email: row.email,
			firstname: row.firstname,
			lastname: row.lastname,
			role: row.role,
			avatar: row.avatar,
			bio: row.bio,
			bio_short: row.bio_short,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findByEmail = async (email: string): Promise<UserWithPassword | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM users WHERE email = ?",
			[email],
		);

		if (!rows[0]) return null;

		const row = rows[0];
		return {
			id: row.id,
			username: row.username,
			email: row.email,
			firstname: row.firstname,
			lastname: row.lastname,
			role: row.role,
			avatar: row.avatar,
			bio: row.bio,
			bio_short: row.bio_short,
			password: row.password,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findByIdentifier = async (
	identifier: string,
): Promise<UserWithPassword | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM users WHERE email = ? OR username = ?",
			[identifier, identifier],
		);

		if (!rows[0]) return null;

		const row = rows[0];
		return {
			id: row.id,
			username: row.username,
			email: row.email,
			firstname: row.firstname,
			lastname: row.lastname,
			role: row.role,
			avatar: row.avatar,
			bio: row.bio,
			bio_short: row.bio_short,
			password: row.password,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const updateData = async (
	id: number,
	data: UserUpdateData,
): Promise<User | null> => {
	try {
		const keys = Object.keys(data);
		const values = Object.values(data);

		if (keys.length === 0) {
			throw new Error("Aucun champ à mettre à jour");
		}

		const fields = keys.map((k) => `${k} = ?`).join(", ");
		values.push(id);

		await pool.query(`UPDATE users SET ${fields} WHERE id = ?`, values);
		return findById(id);
	} catch (err) {
		console.error(err);
		throw err;
	}
};

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
		console.error(err);
		throw err;
	}
};

const create = async (data: UserCreateData): Promise<User> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [existing]: any = await pool.query(
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
		console.error(err);
		throw err;
	}
};

const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM users WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findArtist = async (): Promise<User | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, username, email, firstname, lastname, role,
			avatar, bio, bio_short, created_at, updated_at
			FROM users
			WHERE role = 'editor'
			ORDER BY id ASC
			LIMIT 1`,
		);

		if (!rows[0]) return null;

		const row = rows[0];
		return {
			id: row.id,
			username: row.username,
			email: row.email,
			firstname: row.firstname,
			lastname: row.lastname,
			role: row.role,
			avatar: row.avatar,
			bio: row.bio,
			bio_short: row.bio_short,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

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
		console.error(err);
		throw err;
	}
};

const findByIdWithRefreshToken = async (
	id: number,
): Promise<{ refresh_token: string | null } | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [users]: any = await pool.query(
			"SELECT refresh_token FROM users WHERE id = ?",
			[id],
		);
		if (!users[0]) return null;
		return { refresh_token: users[0].refresh_token };
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const deleteRefreshToken = async (userId: number): Promise<void> => {
	try {
		await pool.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [
			userId,
		]);
	} catch (err) {
		console.error(err);
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
