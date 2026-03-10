import pool from "./db";
import type { Tag } from "../types/tags";

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

// Liste les tags effectivement utilisés (au moins un article ou une image).
const findAll = async (): Promise<Tag[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT t.id, t.name, t.slug
			FROM tags t
			WHERE EXISTS (SELECT 1 FROM articles_tags at WHERE at.tag_id = t.id)
			   OR EXISTS (SELECT 1 FROM images_tags it WHERE it.tag_id = t.id)
			ORDER BY t.name`,
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => rowToTag(row));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

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
		console.error(err);
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
		console.error(err);
		throw err;
	}
};

export default {
	findAll,
	findByArticleId,
	findByImageId,
};
