import type { ResultSetHeader } from "mysql2/promise";
import type { User, UserUpdateData } from "../../types/users";
import { HttpError } from "../../utils/httpErrors";
import logger from "../../utils/logger";
import pool from "../db";
import usersModel from "../usersModel";

const ALLOWED_UPDATE_FIELDS: (keyof UserUpdateData)[] = [
	"username",
	"email",
	"firstname",
	"lastname",
	"avatar",
	"bio",
	"bio_short",
];

const updateMeProfile = async (
	id: number,
	data: UserUpdateData,
): Promise<User | null> => {
	try {
		const updates: string[] = [];
		const values: (string | number | null)[] = [];

		for (const field of ALLOWED_UPDATE_FIELDS) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field] ?? null);
			}
		}

		if (updates.length === 0) {
			throw new HttpError(400, "Aucun champ à mettre à jour");
		}

		// Unicité croisée : un username ne doit coller ni à un username ni à un email
		// existant (et inversement), hors compte courant.
		const identifiers: string[] = [];
		if (typeof data.username === "string") identifiers.push(data.username);
		if (typeof data.email === "string") identifiers.push(data.email);

		if (identifiers.length > 0) {
			const placeholders = identifiers.map(() => "?").join(", ");
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			const [existing]: any = await pool.query(
				`SELECT id, email, username FROM users
				 WHERE id <> ?
				   AND (email IN (${placeholders}) OR username IN (${placeholders}))`,
				[id, ...identifiers, ...identifiers],
			);

			if (existing.length > 0) {
				throw new HttpError(
					409,
					"Cet email ou ce nom d'utilisateur est déjà utilisé",
				);
			}
		}

		values.push(id);
		await pool.query(
			`UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
			values,
		);
		return usersModel.findById(id);
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const updateMePassword = async (
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
		logger.error(err);
		throw err;
	}
};

export default {
	updateMeProfile,
	updateMePassword,
};
