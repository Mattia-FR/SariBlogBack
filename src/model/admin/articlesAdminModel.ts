// models/articlesAdminModel.ts
import pool from "../db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type {
	ArticleAdmin,
	ArticleForAdmin,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";
import type { TagForList } from "../../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================

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
	tags?: string | null; // Pour GROUP_CONCAT
	comments_count?: number; // Nombre de commentaires
}

/**
 * Fonction helper pour parser les tags
 * Utilisée par parseArticleAdminRows pour transformer le GROUP_CONCAT en tableau
 */
function parseTags(tagsString: string | null | undefined): TagForList[] {
	if (!tagsString) return [];

	return tagsString.split("|").map((tagStr) => {
		const [id, name, slug] = tagStr.split(":");
		return {
			id: Number.parseInt(id, 10),
			name,
			slug,
		} as TagForList;
	});
}

/**
 * Fonction helper pour parser les rows avec images et tags
 * (Similaire à celle du model public)
 */
function parseArticleAdminRows(rows: ArticleAdminRow[]): ArticleForAdmin[] {
	return rows.map((row) => {
		const tags = parseTags(row.tags);

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt,
			status: row.status,
			user_id: row.user_id,
			created_at: row.created_at,
			updated_at: row.updated_at,
			published_at: row.published_at,
			views: row.views,
			featured_image_id: row.featured_image_id,
			image_path: row.image_path || undefined,
			tags,
			comments_count: row.comments_count,
		};
	});
}

/**
 * Récupère TOUS les articles (tous statuts) avec leurs détails complets
 * Utilisé pour la liste admin des articles
 * Retourne articles triés par date de mise à jour (les plus récents en premier)
 */
const findAllForAdmin = async (): Promise<ArticleForAdmin[]> => {
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

/**
 * Récupère un article par son ID avec toutes les infos (admin)
 * Inclut le content complet, image, tags et nombre de commentaires
 */
const findByIdForAdmin = async (id: number): Promise<ArticleAdmin | null> => {
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

		// Parser les tags
		const tags = parseTags(row.tags);

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt,
			content: row.content,
			status: row.status,
			user_id: row.user_id,
			created_at: row.created_at,
			updated_at: row.updated_at,
			published_at: row.published_at,
			views: row.views,
			featured_image_id: row.featured_image_id,
			image_path: row.image_path || undefined,
			tags,
			comments_count: row.comments_count,
		} as ArticleAdmin;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article par ID (admin) :",
			err,
		);
		throw err;
	}
};

const create = async (data: ArticleCreateData): Promise<ArticleAdmin> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id, published_at, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			[
				data.title,
				data.slug,
				data.excerpt || null,
				data.content,
				data.status || "draft",
				data.user_id,
				data.featured_image_id || null,
				data.published_at || null,
				data.views ?? 0,
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

// const update = async (id, data) => {
// 	const keys = Object.keys(data);
// 	const values = Object.values(data);

// 	if (keys.length === 0) {
// 		throw new Error("Aucun champ à mettre à jour");
// 	}

// 	const fields = keys.map((k) => `${k} = ?`).join(", ");
// 	values.push(id);

// 	await pool.query(`UPDATE articles SET ${fields} WHERE id = ?`, values);
// 	return findByIdForAdmin(id);
// };

const update = async (
	id: number,
	data: ArticleUpdateData,
): Promise<ArticleAdmin | null> => {
	try {
		// 1. Liste blanche des champs modifiables (SÉCURITÉ)
		const allowedFields = [
			"title",
			"slug",
			"excerpt",
			"content",
			"status",
			"featured_image_id",
			"published_at",
		];

		// 2. Filtrer uniquement les champs autorisés présents dans data
		const updates: string[] = [];
		const values: unknown[] = [];

		for (const field of allowedFields) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field as keyof ArticleUpdateData]);
			}
		}

		// 3. Vérifier qu'il y a au moins un champ à mettre à jour
		if (updates.length === 0) {
			throw new Error("Aucun champ à mettre à jour");
		}

		// 4. Ajouter l'ID à la fin pour le WHERE
		values.push(id);

		// 5. Construire et exécuter la requête
		const query = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;
		const [result] = await pool.query<ResultSetHeader>(query, values);

		if (result.affectedRows === 0) {
			return null;
		}

		// 6. Récupérer et retourner l'article mis à jour
		const updatedArticle = await findByIdForAdmin(id);
		return updatedArticle;
	} catch (err) {
		console.error("Erreur lors de la mise à jour de l'article (admin) :", err);
		throw err;
	}
};

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
