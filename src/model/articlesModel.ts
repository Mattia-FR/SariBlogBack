/**
 * Modèle des articles.
 * Gère la lecture des articles (liste, détail, publiés, homepage).
 * Convertit les lignes BDD (Date, image_path) en Article (dates string, imageUrl).
 */
import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type { Article } from "../types/articles";
import type { Tag } from "../types/tags";
import { buildImageUrl } from "../utils/imageUrl";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par les requêtes SELECT simples (avec ou sans JOIN image).
interface ArticleRow extends RowDataPacket {
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
	image_path?: string | null; // Présent quand JOIN avec images
}

// Type pour les lignes retournées par findPublished / findHomepagePreview (avec GROUP_CONCAT tags).
interface ArticleWithTagsRow extends RowDataPacket {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	status: "draft" | "published" | "archived";
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
	image_path: string | null;
	tags: string | null; // Format GROUP_CONCAT: "id:name:slug|id:name:slug"
}

// ========================================
// HELPERS
// ========================================

/** Convertit une Date ou null en string ISO ou null (pour aligner le type Article). */
function toDateString(value: Date | null): string | null {
	if (value === null) return null;
	return value instanceof Date ? value.toISOString() : String(value);
}

/** Convertit une row BDD (Date, image_path) en Article (dates string, imageUrl). Option content pour findAll (sans content). */
function rowToArticle(
	row: ArticleRow,
	options?: { content?: string },
): Article {
	const { image_path, ...rest } = row;
	return {
		...rest,
		content: options?.content !== undefined ? options.content : row.content,
		created_at: row.created_at.toISOString(),
		updated_at: row.updated_at.toISOString(),
		published_at: toDateString(row.published_at),
		imageUrl: buildImageUrl(image_path),
	};
}

// ========================================
// FONCTIONS
// ========================================

// Récupère tous les articles sans le content (optimisation listes). Retourne Article[].
const findAll = async (): Promise<Article[]> => {
	try {
		const [rows] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles`,
		);
		return rows.map((row) =>
			rowToArticle({ ...row, content: "" } as ArticleRow, {
				content: undefined,
			}),
		);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les articles :", err);
		throw err;
	}
};

// Récupère un article par son ID avec content et image featured. Tous statuts (admin). Retourne Article | null.
const findById = async (id: number): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.id = ?`,
			[id],
		);
		if (!articles[0]) return null;
		return rowToArticle(articles[0]);
	} catch (err) {
		console.error("Erreur lors de la récupération de l'article par ID :", err);
		throw err;
	}
};

// Récupère un article par son slug avec content et image. Tous statuts (admin / preview). Pour le public, utiliser findPublishedBySlug.
const findBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.slug = ?`,
			[slug],
		);
		if (!articles[0]) return null;
		return rowToArticle(articles[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article par slug :",
			err,
		);
		throw err;
	}
};

// Parse les rows avec GROUP_CONCAT tags en Article[] (dates string, imageUrl, tags).
function parseArticleRows(rows: ArticleWithTagsRow[]): Article[] {
	return rows.map((row) => {
		const tags: Tag[] = row.tags
			? row.tags.split("|").map((tagStr) => {
					const [id, name, slug] = tagStr.split(":");
					return {
						id: Number.parseInt(id, 10),
						name,
						slug,
					} as Tag;
				})
			: [];

		return {
			id: row.id,
			title: row.title,
			slug: row.slug,
			excerpt: row.excerpt,
			status: row.status,
			user_id: row.user_id,
			created_at: row.created_at.toISOString(),
			updated_at: row.updated_at.toISOString(),
			published_at: toDateString(row.published_at),
			views: row.views,
			featured_image_id: row.featured_image_id,
			imageUrl: buildImageUrl(row.image_path),
			tags,
		};
	});
}

// Récupère les articles publiés (status = 'published') avec image et tags. Option limit. Retourne Article[].
const findPublished = async (limit?: number): Promise<Article[]> => {
	try {
		let query = `
			SELECT 
				a.id, a.title, a.slug, a.excerpt, a.status, a.user_id,
				a.created_at, a.updated_at, a.published_at, a.views,
				a.featured_image_id,
				i.path as image_path,
				GROUP_CONCAT(
					DISTINCT CONCAT(t.id, ':', t.name, ':', t.slug) 
					ORDER BY t.id 
					SEPARATOR '|'
				) as tags
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			LEFT JOIN articles_tags at ON a.id = at.article_id
			LEFT JOIN tags t ON at.tag_id = t.id
			WHERE a.status = 'published'
			GROUP BY a.id, a.title, a.slug, a.excerpt, a.status, a.user_id,
			        a.created_at, a.updated_at, a.published_at, a.views,
			        a.featured_image_id, i.path
			ORDER BY a.published_at DESC
		`;

		if (limit !== undefined && limit > 0) {
			query += " LIMIT ?";
			const [rows] = await pool.query<ArticleWithTagsRow[]>(query, [limit]);
			return parseArticleRows(rows);
		}

		const [rows] = await pool.query<ArticleWithTagsRow[]>(query);
		return parseArticleRows(rows);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés :", err);
		throw err;
	}
};

// Récupère un article publié par ID (avec content). Public uniquement si status = 'published'.
const findPublishedById = async (id: number): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.status = 'published' AND a.id = ?`,
			[id],
		);
		if (!articles[0]) return null;
		return rowToArticle(articles[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par ID :",
			err,
		);
		throw err;
	}
};

// Récupère un article publié par slug (avec content). Public. Garantit qu'aucun brouillon n'est exposé.
const findPublishedBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.status = 'published' AND a.slug = ?`,
			[slug],
		);
		if (!articles[0]) return null;
		return rowToArticle(articles[0]);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par slug :",
			err,
		);
		throw err;
	}
};

// Récupère les 4 derniers articles publiés pour la preview homepage. Réutilise findPublished(4).
const findHomepagePreview = async (): Promise<Article[]> => {
	return findPublished(4);
};

export default {
	findAll,
	findById,
	findBySlug,
	findPublished,
	findPublishedById,
	findPublishedBySlug,
	findHomepagePreview,
};
