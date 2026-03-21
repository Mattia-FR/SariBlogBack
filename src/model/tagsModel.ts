import pool from "./db";
import type { Tag } from "../types/tags";
import logger from "../utils/logger";

/* J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
Le frontend reçoit toujours des objets strictement conformes à l'interface Tag.
Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet. */

// Convertit une row en Tag (id, name, slug uniquement).
// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
function rowToTag(row: any): Tag {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
	};
}

const findByArticleId = async (id: number): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN articles_tags at ON t.id = at.tag_id
			WHERE at.article_id = ?`,
			[id],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => rowToTag(row));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByImageId = async (id: number): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN images_tags it ON t.id = it.tag_id
			WHERE it.image_id = ?`,
			[id],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => rowToTag(row));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

// Tags liés à au moins un article au statut published (pour filtres blog public).
const findUsedOnPublishedArticles = async (): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT DISTINCT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN articles_tags at ON t.id = at.tag_id
			INNER JOIN articles a ON a.id = at.article_id
			WHERE a.status = 'published'
			ORDER BY t.name`,
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => rowToTag(row));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

// Tags liés à au moins une image en galerie dans une catégorie donnée.
const findUsedOnGalleryImagesByCategoryId = async (
	categoryId: number,
): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT DISTINCT t.id, t.name, t.slug
			FROM tags t
			INNER JOIN images_tags it ON t.id = it.tag_id
			INNER JOIN images i ON i.id = it.image_id
			INNER JOIN images_categories ic ON ic.image_id = i.id
			WHERE ic.category_id = ? AND i.is_in_gallery = TRUE
			ORDER BY t.name`,
			[categoryId],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => rowToTag(row));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export default {
	findByArticleId,
	findByImageId,
	findUsedOnPublishedArticles,
	findUsedOnGalleryImagesByCategoryId,
};
