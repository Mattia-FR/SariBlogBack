import pool from "../db";
import type { ResultSetHeader } from "mysql2/promise";
import type {
	Image,
	ImageCreateData,
	ImageUpdateData,
} from "../../types/images";
import { toDateString } from "../../utils/dateHelpers";
import imagesModel from "../imagesModel";

const { findById } = imagesModel;

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Image.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findAll = async (): Promise<Image[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
			FROM images
			ORDER BY created_at DESC`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tagsRows]: any = await pool.query(
			`SELECT it.image_id, t.id, t.name, t.slug
			FROM images_tags it
			LEFT JOIN tags t ON it.tag_id = t.id`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			path: row.path,
			alt_descr: row.alt_descr,
			is_in_gallery: row.is_in_gallery,
			user_id: row.user_id,
			article_id: row.article_id,
			created_at: toDateString(row.created_at),
			updated_at: toDateString(row.updated_at),
			tags: tagsRows
				.filter((t: { image_id: number }) => t.image_id === row.id)
				.map((t: { id: number; name: string; slug: string }) => ({
					id: t.id,
					name: t.name,
					slug: t.slug,
				})),
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const create = async (data: ImageCreateData): Promise<Image> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			`INSERT INTO images (title, description, path, alt_descr, is_in_gallery, user_id, article_id)
			VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[
				data.title ?? null,
				data.description ?? null,
				data.path,
				data.alt_descr ?? null,
				data.is_in_gallery ?? false,
				data.user_id,
				data.article_id ?? null,
			],
		);

		const imageId = result.insertId;
		const tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
		if (tagIds.length > 0) {
			const values = tagIds.map((tagId: number) => [imageId, tagId]);
			await pool.query("INSERT INTO images_tags (image_id, tag_id) VALUES ?", [
				values,
			]);
		}

		const created = await findById(imageId);
		if (!created) throw new Error("Impossible de récupérer l'image créée");
		return created;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const update = async (
	id: number,
	data: ImageUpdateData,
): Promise<Image | null> => {
	try {
		const allowedFields: (keyof ImageUpdateData)[] = [
			"title",
			"description",
			"path",
			"alt_descr",
			"is_in_gallery",
			"article_id",
		];

		const updates: string[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const values: any[] = [];

		for (const field of allowedFields) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field]);
			}
		}

		if (updates.length > 0) {
			values.push(id);
			const [res] = await pool.query<ResultSetHeader>(
				`UPDATE images SET ${updates.join(", ")} WHERE id = ?`,
				values,
			);
			if (res.affectedRows === 0) return null;
		}

		if ("tag_ids" in data) {
			const tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
			await pool.query("DELETE FROM images_tags WHERE image_id = ?", [id]);
			if (tagIds.length > 0) {
				const tagValues = tagIds.map((tagId: number) => [id, tagId]);
				await pool.query(
					"INSERT INTO images_tags (image_id, tag_id) VALUES ?",
					[tagValues],
				);
			}
		}

		return findById(id);
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM images WHERE id = ?",
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
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM images",
		);
		return rows[0].total;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const countInGallery = async (): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM images WHERE is_in_gallery = TRUE",
		);
		return rows[0].total;
	} catch (err) {
		console.error(err);
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
	countInGallery,
};
