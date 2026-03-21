import pool from "./db";
import type { Image } from "../types/images";
import { toDateString } from "../utils/dateHelpers";
import logger from "../utils/logger";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, tags), le frontend reçoit toujours des objets strictement conformes à l'interface Image.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findGallery = async (): Promise<Image[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [images]: any = await pool.query(
			`SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery,
			i.user_id, i.article_id, i.created_at, i.updated_at
			FROM images i
			WHERE i.is_in_gallery = TRUE
			ORDER BY i.created_at DESC`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT it.image_id, t.id, t.name, t.slug
			FROM images_tags it
			LEFT JOIN tags t ON it.tag_id = t.id`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return images.map((image: any) => ({
			id: image.id,
			title: image.title,
			description: image.description,
			path: image.path,
			alt_descr: image.alt_descr,
			is_in_gallery: image.is_in_gallery,
			user_id: image.user_id,
			article_id: image.article_id,
			created_at: toDateString(image.created_at) ?? "",
			updated_at: toDateString(image.updated_at) ?? "",
			tags: tags
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.filter((t: any) => t.image_id === image.id)
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<Image | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
			FROM images
			WHERE id = ?`,
			[id],
		);

		if (!rows[0]) return null;

		const row = rows[0];
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			path: row.path,
			alt_descr: row.alt_descr,
			is_in_gallery: row.is_in_gallery,
			user_id: row.user_id,
			article_id: row.article_id,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByArticleId = async (id: number): Promise<Image[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
			FROM images 
			WHERE article_id = ?`,
			[id],
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
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByTagId = async (id: number): Promise<Image[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.created_at, i.updated_at
			FROM images i
			INNER JOIN images_tags it ON i.id = it.image_id
			WHERE it.tag_id = ?`,
			[id],
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
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByCategoryId = async (
	categoryId: number,
	page: number,
	limit: number,
	tagId?: number,
): Promise<{ images: Image[]; total: number }> => {
	const offset = (page - 1) * limit;
	try {
		const tagJoin =
			tagId != null
				? "INNER JOIN images_tags tagf ON tagf.image_id = i.id AND tagf.tag_id = ?"
				: "";

		const countParams = tagId != null ? [tagId, categoryId] : [categoryId];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [countResult]: any = await pool.query(
			tagId != null
				? `SELECT COUNT(DISTINCT i.id) as total
			FROM images i
			INNER JOIN images_categories ic ON i.id = ic.image_id
			${tagJoin}
			WHERE ic.category_id = ? AND i.is_in_gallery = TRUE`
				: `SELECT COUNT(*) as total
			FROM images i
			INNER JOIN images_categories ic ON i.id = ic.image_id
			WHERE ic.category_id = ? AND i.is_in_gallery = TRUE`,
			countParams,
		);
		const total = countResult[0].total as number;

		const listParams =
			tagId != null
				? [tagId, categoryId, limit, offset]
				: [categoryId, limit, offset];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [images]: any = await pool.query(
			`SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery,
			i.user_id, i.article_id, i.created_at, i.updated_at
			FROM images i
			INNER JOIN images_categories ic ON i.id = ic.image_id
			${tagJoin}
			WHERE ic.category_id = ? AND i.is_in_gallery = TRUE
			ORDER BY i.created_at DESC
			LIMIT ? OFFSET ?`,
			listParams,
		);

		if (images.length === 0) {
			return { images: [], total };
		}

		const imageIds: number[] = images.map((image: { id: number }) => image.id);
		const placeholders = imageIds.map(() => "?").join(",");

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT it.image_id, t.id, t.name, t.slug
			FROM images_tags it
			LEFT JOIN tags t ON it.tag_id = t.id
			WHERE it.image_id IN (${placeholders})`,
			imageIds,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const mapped: Image[] = images.map((image: any) => ({
			id: image.id,
			title: image.title,
			description: image.description,
			path: image.path,
			alt_descr: image.alt_descr,
			is_in_gallery: image.is_in_gallery,
			user_id: image.user_id,
			article_id: image.article_id,
			created_at: toDateString(image.created_at) ?? "",
			updated_at: toDateString(image.updated_at) ?? "",
			tags: tags
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.filter((t: any) => t.image_id === image.id)
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
		}));

		return { images: mapped, total };
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findImageOfTheDay = async (): Promise<Image | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
			FROM images
			WHERE is_in_gallery = TRUE
			ORDER BY id ASC`,
		);

		if (rows.length === 0) {
			return null;
		}

		const today = new Date();
		const startOfYear = new Date(today.getFullYear(), 0, 1);
		const dayOfYear = Math.floor(
			(today.getTime() - startOfYear.getTime()) / 86400000,
		);
		const imageIndex = dayOfYear % rows.length;

		const row = rows[imageIndex];
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			path: row.path,
			alt_descr: row.alt_descr,
			is_in_gallery: row.is_in_gallery,
			user_id: row.user_id,
			article_id: row.article_id,
			created_at: toDateString(row.created_at) ?? "",
			updated_at: toDateString(row.updated_at) ?? "",
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export default {
	findGallery,
	findById,
	findByArticleId,
	findByTagId,
	findByCategoryId,
	findImageOfTheDay,
};
