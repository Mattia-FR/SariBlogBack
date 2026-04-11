import pool from "../db";
import type { Tag } from "../../types/tags";
import type { ResultSetHeader } from "mysql2/promise";
import logger from "../../utils/logger";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Tag.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findAll = async (): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT id, name, slug FROM tags ORDER BY name",
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<Tag | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query("SELECT * FROM tags WHERE id = ?", [
			id,
		]);
		if (!rows[0]) return null;
		const row = rows[0];
		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
		};
	} catch (err) {
		logger.error(err);
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
			name: data.name,
			slug: data.slug,
		};
	} catch (err) {
		logger.error(err);
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
		logger.error(err);
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
		logger.error(err);
		throw err;
	}
};

const countAll = async (): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM tags");
		return rows[0].total;
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

// Tags liés à au moins un article (tous statuts), pour filtre liste articles admin.
const findUsedOnArticles = async (): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT DISTINCT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN articles_tags at ON t.id = at.tag_id
			ORDER BY t.name`,
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

// Tags liés à au moins une image (filtre admin liste images).
const findUsedOnImages = async (): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT DISTINCT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN images_tags it ON t.id = it.tag_id
			ORDER BY t.name`,
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			name: row.name,
			slug: row.slug,
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export default {
	findAll,
	findById,
	create,
	update,
	deleteOne,
	countAll,
	findUsedOnArticles,
	findUsedOnImages,
};
