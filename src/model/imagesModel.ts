/**
 * Modèle des images.
 * Gère la lecture : galerie (avec tags), par ID, par article, par tag, image du jour.
 * Convertit les lignes BDD (Date) en Image (created_at, updated_at en string).
 */
import pool from "./db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
	Image,
	ImageCreateData,
	ImageUpdateData,
} from "../types/images";
import type { Tag } from "../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par les requêtes SELECT complètes.
interface ImageRow extends RowDataPacket {
	id: number;
	title: string | null;
	description: string | null;
	path: string;
	alt_descr: string | null;
	is_in_gallery: boolean;
	user_id: number;
	article_id: number | null;
	created_at: Date;
	updated_at: Date;
}

// Type pour les lignes retournées par findGallery (avec GROUP_CONCAT tags).
interface GalleryRow extends RowDataPacket {
	id: number;
	title: string | null;
	description: string | null;
	path: string;
	alt_descr: string | null;
	is_in_gallery: boolean;
	user_id: number;
	article_id: number | null;
	created_at: Date;
	updated_at: Date;
	tags: string | null; // Format GROUP_CONCAT: "id:name:slug|id:name:slug"
}

// ========================================
// HELPERS
// ========================================

/** Convertit une Date en string ISO. */
function toDateString(value: Date): string {
	return value instanceof Date ? value.toISOString() : String(value);
}

/** Convertit une row ImageRow en Image (dates string). */
function rowToImage(row: ImageRow): Image {
	return {
		...row,
		created_at: toDateString(row.created_at),
		updated_at: toDateString(row.updated_at),
	};
}

/** Parse la chaîne GROUP_CONCAT des tags en Tag[]. */
function parseTags(tagsString: string | null | undefined): Tag[] {
	if (!tagsString) return [];

	return tagsString.split("|").map((tagStr) => {
		const [id, name, slug] = tagStr.split(":");
		return {
			id: Number.parseInt(id, 10),
			name,
			slug,
		} as Tag;
	});
}

/** Parse les rows galerie (avec tags) en Image[] (dates string, tags). */
function parseImageRows(rows: GalleryRow[]): Image[] {
	return rows.map((row) => {
		const tags = parseTags(row.tags);
		return {
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
			tags,
		};
	});
}

// ========================================
// FONCTIONS
// ========================================

// Récupère toutes les images. Retourne Image[] (dates string).
const findAll = async (): Promise<Image[]> => {
	try {
		const [rows] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images`,
		);
		return rows.map(rowToImage);
	} catch (err) {
		console.error("Erreur lors de la récupération de toutes les images :", err);
		throw err;
	}
};

// Récupère les images de la galerie (is_in_gallery = TRUE) avec tags. Retourne Image[] (dates string, tags).
const findGallery = async (): Promise<Image[]> => {
	try {
		const query = `
			SELECT 
				i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery,
				i.user_id, i.article_id, i.created_at, i.updated_at,
				GROUP_CONCAT(
					DISTINCT CONCAT(t.id, ':', t.name, ':', t.slug) 
					ORDER BY t.id 
					SEPARATOR '|'
				) as tags
			FROM images i
			LEFT JOIN images_tags it ON i.id = it.image_id
			LEFT JOIN tags t ON it.tag_id = t.id
			WHERE i.is_in_gallery = TRUE
			GROUP BY i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.created_at, i.updated_at
			ORDER BY i.created_at DESC
		`;

		const [rows] = await pool.query<GalleryRow[]>(query);
		return parseImageRows(rows);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images de la galerie :",
			err,
		);
		throw err;
	}
};

// Récupère une image par ID. Retourne Image | null (dates string).
const findById = async (id: number): Promise<Image | null> => {
	try {
		const [rows] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images
      WHERE id = ?`,
			[id],
		);
		if (!rows[0]) return null;
		return rowToImage(rows[0]);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image par ID :", err);
		throw err;
	}
};

// Récupère les images associées à un article par ID. Retourne Image[] (dates string, sans tags).
const findByArticleId = async (id: number): Promise<Image[]> => {
	try {
		const [rows] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images 
      WHERE article_id = ?`,
			[id],
		);
		return rows.map(rowToImage);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID d'article :",
			err,
		);
		throw err;
	}
};

// Récupère les images associées à un tag par ID. Retourne Image[] (dates string).
const findByTagId = async (id: number): Promise<Image[]> => {
	try {
		const [rows] = await pool.query<ImageRow[]>(
			`SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.created_at, i.updated_at
      FROM images i
      INNER JOIN images_tags it ON i.id = it.image_id
      WHERE it.tag_id = ?`,
			[id],
		);
		return rows.map(rowToImage);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID de tag :",
			err,
		);
		throw err;
	}
};

// Récupère l'image du jour (galerie, sélection déterministe par jour de l'année). Retourne Image | null (dates string).
const findImageOfTheDay = async (): Promise<Image | null> => {
	try {
		const [rows] = await pool.query<ImageRow[]>(
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

		return rowToImage(rows[imageIndex]);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image du jour :", err);
		throw err;
	}
};

// Crée une image. Retourne l'image créée (dates string).
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
		const created = await findById(result.insertId);
		if (!created) throw new Error("Impossible de récupérer l'image créée");
		return created;
	} catch (err) {
		console.error("Erreur lors de la création de l'image :", err);
		throw err;
	}
};

// Met à jour une image (champs optionnels). Retourne l'image mise à jour ou null.
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
		const values: unknown[] = [];
		for (const field of allowedFields) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field]);
			}
		}
		if (updates.length === 0) return findById(id);
		values.push(id);
		const [res] = await pool.query<ResultSetHeader>(
			`UPDATE images SET ${updates.join(", ")} WHERE id = ?`,
			values,
		);
		if (res.affectedRows === 0) return null;
		return findById(id);
	} catch (err) {
		console.error("Erreur lors de la mise à jour de l'image :", err);
		throw err;
	}
};

// Supprime une image par ID. Retourne true si une ligne a été supprimée.
const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM images WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error("Erreur lors de la suppression de l'image :", err);
		throw err;
	}
};

export default {
	findAll,
	findGallery,
	findById,
	findByArticleId,
	findByTagId,
	findImageOfTheDay,
	create,
	update,
	deleteOne,
};
