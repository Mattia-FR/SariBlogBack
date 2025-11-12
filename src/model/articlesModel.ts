import pool from "./db";
import type {
	Article,
	ArticleRow,
	ArticleListItem,
} from "../types/articles";

// Récupère tous les articles de la base de données, sans le content.
// Utilisé pour les listes d'articles (admin ou publique).
// Retourne un tableau de ArticleListItem (sans content LONGTEXT) pour optimiser les performances.
const findAll = async (): Promise<ArticleListItem[]> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles`,
		);
		return articles;
	} catch (err) {
		console.error("Error fetching all articles:", err);
		throw err;
	}
};

// Récupère un article par son ID, avec le content complet.
// Utilisé pour afficher un article individuel.
// Retourne Article | null (avec content) pour afficher l'article complet.
const findById = async (id: number): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE id = ?`,
			[id],
		);
		return articles[0] || null;
	} catch (err) {
		console.error("Error fetching article by id:", err);
		throw err;
	}
};

const findBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE slug = ?`,
			[slug],
		);
		return articles[0] || null;
	} catch (err) {
		console.error("Error fetching article by slug:", err);
		throw err;
	}
};

const findPublished = async (): Promise<ArticleListItem[]> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE status = 'published'`,
		);
		return articles;
	} catch (err) {
		console.error("Error fetching published articles:", err);
		throw err;
	}
};

const findPublishedBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [articles] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE status = 'published' AND slug = ?`,
			[slug],
		);
		return articles[0] || null;
	} catch (err) {
		console.error("Error fetching published article by slug:", err);
		throw err;
	}
};

export default {
	findAll,
	findById,
	findBySlug,
	findPublished,
	findPublishedBySlug,
};
