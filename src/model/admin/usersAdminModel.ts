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
