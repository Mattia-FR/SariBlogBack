/**
 * Modèle admin des articles.
 * CRUD complet : liste (avec tags + comments_count), détail, création, mise à jour, suppression.
 * Convertit les lignes BDD (Date, image_path) en Article (dates string, imageUrl).
 */
import pool from "../db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
	Article,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";
import type { Tag } from "../../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par les requêtes admin (avec GROUP_CONCAT tags et COUNT commentaires).
interface ArticleAdminRow extends RowDataPacket {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	status: "draft" | "published" | "archived";
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
	image_path?: string | null;
	tags?: string | null; // Format GROUP_CONCAT: "id:name:slug|id:name:slug"
	comments_count?: number;
}

// ========================================
// HELPERS
// ========================================

/** Convertit une Date ou null en string ISO ou null. */
function toDateString(value: Date | null): string | null {
	if (value === null) return null;
	return value instanceof Date ? value.toISOString() : String(value);
}

/** Parse la chaîne GROUP_CONCAT des tags en tableau Tag[]. */
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

/** Type pour un article admin : Article + comments_count (optionnel). */
type ArticleWithCommentsCount = Article & { comments_count?: number };

/** Parse les rows admin (avec tags et comments_count) en ArticleWithCommentsCount[]. */
function parseArticleAdminRows(rows: ArticleAdminRow[]): ArticleWithCommentsCount[] {
	return rows.map((row) => {
		const tags = parseTags(row.tags);

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at)!,
			updated_at: toDateString(row.updated_at)!,
			published_at: toDateString(row.published_at),
			views: row.views,
			featured_image_id: row.featured_image_id,
			imageUrl: row.image_path ?? undefined,
			tags,
			comments_count: row.comments_count,
		};
	});
}

// ========================================
// FONCTIONS
// ========================================

// Récupère tous les articles (tous statuts) avec tags et nombre de commentaires. Tri par updated_at DESC.
const findAllForAdmin = async (): Promise<ArticleWithCommentsCount[]> => {
	try {
		const [rows] = await pool.query<ArticleAdminRow[]>(
			`
      SELECT 
        a.id, 
        a.title, 
        a.slug, 
        a.excerpt, 
        a.status, 
        a.user_id,
        a.created_at, 
        a.updated_at, 
        a.published_at, 
        a.views,
        a.featured_image_id,
        i.path as image_path,
        GROUP_CONCAT(
          DISTINCT CONCAT(t.id, ':', t.name, ':', t.slug) 
          ORDER BY t.id 
          SEPARATOR '|'
        ) as tags,
        COUNT(DISTINCT c.id) as comments_count
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      LEFT JOIN articles_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      LEFT JOIN comments c ON a.id = c.article_id
      GROUP BY a.id, a.title, a.slug, a.excerpt, a.status, a.user_id,
              a.created_at, a.updated_at, a.published_at, a.views,
              a.featured_image_id, i.path
      ORDER BY a.updated_at DESC
      `,
		);

		return parseArticleAdminRows(rows);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles (admin) :", err);
		throw err;
	}
};

// Récupère un article par ID avec content, image, tags et nombre de commentaires (admin).
const findByIdForAdmin = async (id: number): Promise<ArticleWithCommentsCount | null> => {
	try {
		const [rows] = await pool.query<ArticleAdminRow[]>(
			`
      SELECT 
        a.id, 
        a.title, 
        a.slug, 
        a.excerpt,
        a.content,
        a.status, 
        a.user_id,
        a.created_at, 
        a.updated_at, 
        a.published_at, 
        a.views,
        a.featured_image_id,
        i.path as image_path,
        GROUP_CONCAT(
          DISTINCT CONCAT(t.id, ':', t.name, ':', t.slug) 
          ORDER BY t.id 
          SEPARATOR '|'
        ) as tags,
        COUNT(DISTINCT c.id) as comments_count
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      LEFT JOIN articles_tags at ON a.id = at.article_id
      LEFT JOIN tags t ON at.tag_id = t.id
      LEFT JOIN comments c ON a.id = c.article_id
      WHERE a.id = ?
      GROUP BY a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id,
              a.created_at, a.updated_at, a.published_at, a.views,
              a.featured_image_id, i.path
      `,
			[id],
		);

		if (rows.length === 0) {
			return null;
		}

		const row = rows[0];
		const tags = parseTags(row.tags);

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt,
			content: row.content,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at)!,
			updated_at: toDateString(row.updated_at)!,
			published_at: toDateString(row.published_at),
			views: row.views,
			featured_image_id: row.featured_image_id,
			imageUrl: row.image_path ?? undefined,
			tags,
			comments_count: row.comments_count,
		};
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article par ID (admin) :",
			err,
		);
		throw err;
	}
};

// Crée un nouvel article. published_at accepté en string (ISO) ou null. Retourne l'article créé avec tags et comments_count.
const create = async (data: ArticleCreateData): Promise<ArticleWithCommentsCount> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id, published_at, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				data.title,
				data.slug,
				data.excerpt ?? null,
				data.content,
				data.status ?? "draft",
				data.user_id,
				data.featured_image_id ?? null,
				data.published_at ?? null,
				0,
			],
		);

		const newArticle = await findByIdForAdmin(result.insertId);
		if (!newArticle) {
			throw new Error("Impossible de récupérer l'article créé");
		}
		return newArticle;
	} catch (err) {
		console.error("Erreur lors de la création de l'article (admin) :", err);
		throw err;
	}
};

// Met à jour un article (liste blanche de champs). published_at en string ou null. Retourne l'article mis à jour ou null si non trouvé.
const update = async (
	id: number,
	data: ArticleUpdateData,
): Promise<ArticleWithCommentsCount | null> => {
	try {
		const allowedFields = [
			"title",
			"slug",
			"excerpt",
			"content",
			"status",
			"featured_image_id",
			"published_at",
		];

		const updates: string[] = [];
		const values: unknown[] = [];

		for (const field of allowedFields) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field as keyof ArticleUpdateData]);
			}
		}

		if (updates.length === 0) {
			throw new Error("Aucun champ à mettre à jour");
		}

		values.push(id);

		const query = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;
		const [result] = await pool.query<ResultSetHeader>(query, values);

		if (result.affectedRows === 0) {
			return null;
		}

		const updatedArticle = await findByIdForAdmin(id);
		return updatedArticle;
	} catch (err) {
		console.error("Erreur lors de la mise à jour de l'article (admin) :", err);
		throw err;
	}
};

// Supprime un article par ID. Retourne true si une ligne a été supprimée.
const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM articles WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		if (err instanceof Error) {
			console.error(
				"Erreur lors de la suppression de l'article :",
				err.message,
			);
		}
		throw err;
	}
};

export default {
	findAllForAdmin,
	findByIdForAdmin,
	create,
	update,
	deleteOne,
};
