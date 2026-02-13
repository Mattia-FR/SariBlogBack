// Back/src/models/admin/tagsAdminModel.ts
import pool from "../db";
import type { Tag } from "../../types/tags";
import type { ResultSetHeader } from "mysql2/promise";

const findById = async (id: number): Promise<Tag | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query("SELECT * FROM tags WHERE id = ?", [
			id,
		]);
		return rows[0] || null;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const create = async (data: { name: string; slug: string }): Promise<Tag> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO tags (name, slug) VALUES (?, ?)",
			[data.name, data.slug],
		);

		return {
			id: result.insertId,
			...data,
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const update = async (
	id: number,
	data: { name?: string; slug?: string },
): Promise<Tag | null> => {
	try {
		const updates: string[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const values: any[] = [];

		if (data.name) {
			updates.push("name = ?");
			values.push(data.name);
		}
		if (data.slug) {
			updates.push("slug = ?");
			values.push(data.slug);
		}

		if (updates.length === 0) {
			throw new Error("Aucun champ à mettre à jour");
		}

		values.push(id);

		const [result] = await pool.query<ResultSetHeader>(
			`UPDATE tags SET ${updates.join(", ")} WHERE id = ?`,
			values,
		);

		if (result.affectedRows === 0) {
			return null;
		}

		return await findById(id);
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM tags WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const countAll = async (): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM tags");
		return rows[0].total;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default {
	findById,
	create,
	update,
	deleteOne,
	countAll,
};
