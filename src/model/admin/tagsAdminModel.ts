import type { ResultSetHeader } from "mysql2/promise";
import type { Tag } from "../../types/tags";
import { HttpError } from "../../utils/httpErrors";
import { isDuplicateEntry } from "../../utils/mysqlErrors";
import pool from "../db";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Tag.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

function rethrowDuplicate(err: unknown): never {
	if (isDuplicateEntry(err)) {
		throw new HttpError(
			409,
			"Un tag avec ce nom ou ce slug existe déjà",
			"TAG_TAKEN",
		);
	}
	throw err;
}

const findAll = async (): Promise<Tag[]> => {
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
};

const findById = async (id: number): Promise<Tag | null> => {
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [rows]: any = await pool.query("SELECT * FROM tags WHERE id = ?", [id]);
	if (!rows[0]) return null;
	const row = rows[0];
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
	};
};

const create = async (data: { name: string; slug: string }): Promise<Tag> => {
	const [result] = await pool
		.query<ResultSetHeader>("INSERT INTO tags (name, slug) VALUES (?, ?)", [
			data.name,
			data.slug,
		])
		.catch(rethrowDuplicate);

	return {
		id: result.insertId,
		name: data.name,
		slug: data.slug,
	};
};

const update = async (
	id: number,
	data: { name?: string; slug?: string },
): Promise<Tag | null> => {
	const updates: string[] = [];
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const values: any[] = [];

	if (data.name !== undefined) {
		updates.push("name = ?");
		values.push(data.name);
	}
	if (data.slug !== undefined) {
		updates.push("slug = ?");
		values.push(data.slug);
	}

	values.push(id);

	const [result] = await pool
		.query<ResultSetHeader>(
			`UPDATE tags SET ${updates.join(", ")} WHERE id = ?`,
			values,
		)
		.catch(rethrowDuplicate);

	if (result.affectedRows === 0) {
		return null;
	}

	return await findById(id);
};

const deleteOne = async (id: number): Promise<boolean> => {
	const [result] = await pool.query<ResultSetHeader>(
		"DELETE FROM tags WHERE id = ?",
		[id],
	);
	return result.affectedRows > 0;
};

const countAll = async (): Promise<number> => {
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM tags");
	return rows[0].total;
};

// Tags liés à au moins un article (tous statuts), pour filtre liste articles admin.
const findUsedOnArticles = async (): Promise<Tag[]> => {
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
};

// Tags liés à au moins une image (filtre admin liste images).
const findUsedOnImages = async (): Promise<Tag[]> => {
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
