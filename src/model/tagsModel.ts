/**
 * Modèle des tags.
 * Gère la lecture : tous les tags, par article, par image.
 * Le type Tag n'expose que id, name, slug (pas de created_at).
 */
import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type { Tag } from "../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par les requêtes SELECT (la BDD a created_at, on ne l'expose pas).
interface TagRow extends RowDataPacket {
	id: number;
	name: string;
	slug: string;
	created_at?: Date;
}

// ========================================
// HELPERS
// ========================================

/** Convertit une row en Tag (id, name, slug uniquement). */
function rowToTag(row: TagRow): Tag {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
	};
}

// ========================================
// FONCTIONS
// ========================================

// Récupère tous les tags. Retourne Tag[] (id, name, slug).
const findAll = async (): Promise<Tag[]> => {
	try {
		const [rows] = await pool.query<TagRow[]>(
			"SELECT id, name, slug FROM tags",
		);
		return rows.map(rowToTag);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les tags :", err);
		throw err;
	}
};

// Récupère les tags associés à un article (via articles_tags). Retourne Tag[] (id, name, slug).
const findByArticleId = async (id: number): Promise<Tag[]> => {
	try {
		const [rows] = await pool.query<TagRow[]>(
			`SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN articles_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?`,
			[id],
		);
		return rows.map(rowToTag);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'article :",
			err,
		);
		throw err;
	}
};

// Récupère les tags associés à une image (via images_tags). Retourne Tag[] (id, name, slug).
const findByImageId = async (id: number): Promise<Tag[]> => {
	try {
		const [rows] = await pool.query<TagRow[]>(
			`SELECT t.id, t.name, t.slug
      FROM tags t
      INNER JOIN images_tags it ON t.id = it.tag_id
      WHERE it.image_id = ?`,
			[id],
		);
		return rows.map(rowToTag);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'image :",
			err,
		);
		throw err;
	}
};

export default {
	findAll,
	findByArticleId,
	findByImageId,
};
