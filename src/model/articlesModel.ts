import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type {
	Article,
	ArticleListItem,
	ArticleForList,
} from "../types/articles";
import type { TagForList } from "../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model

// Type pour les lignes retournées par les requêtes SELECT simples
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

// Type pour les lignes retournées par findPublished/findHomepagePreview avec GROUP_CONCAT
interface HomepagePreviewRow extends RowDataPacket {
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
		console.error("Erreur lors de la récupération de tous les articles :", err);
		throw err;
	}
};

// Récupère un article par son ID, avec le content complet et l'image featured.
// Utilisé pour afficher un article individuel.
// Retourne Article | null (avec content et image_path) pour afficher l'article complet.
const findById = async (id: number): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.id = ?`,
			[id],
		);
		return article[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'article par ID :", err);
		throw err;
	}
};

// Récupère un article par son slug, avec le content complet et l'image featured.
// Utilisé pour afficher un article individuel via son URL-friendly slug (admin ou preview).
// Retourne Article | null (avec content et image_path) pour afficher l'article complet.
// ATTENTION : Ne filtre pas par statut, peut retourner des articles non publiés.
// Pour l'affichage public, utiliser findPublishedBySlug à la place.
const findBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.slug = ?`,
			[slug],
		);
		return article[0] || null;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article par slug :",
			err,
		);
		throw err;
	}
};

/**
 * Fonction helper pour parser les rows avec images et tags
 * Utilisée par findPublished et findHomepagePreview pour éviter la duplication
 */
function parseArticleRows(rows: HomepagePreviewRow[]): ArticleForList[] {
	return rows.map((row) => {
		// Construire le tableau de tags depuis le GROUP_CONCAT
		const tags: TagForList[] = row.tags
			? row.tags.split("|").map((tagStr) => {
					const [id, name, slug] = tagStr.split(":");
					return {
						id: Number.parseInt(id, 10),
						name,
						slug,
					} as TagForList;
				})
			: [];

		// Retourner l'article avec le chemin relatif de l'image
		// Le controller se chargera de l'enrichir avec l'URL complète
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
		} as ArticleForList;
	});
}

/**
 * Récupère tous les articles publiés (status = 'published') avec leurs détails complets (image + tags)
 * Utilisé pour les listes d'articles publiques (page d'accueil, liste des articles).
 * Retourne un tableau de ArticleForList avec image et tags enrichis.
 *
 * @param limit - Nombre maximum d'articles à retourner (optionnel). Si non fourni, retourne tous les articles.
 * @returns Promise<ArticleForList[]> - Articles publiés avec image et tags
 */
const findPublished = async (limit?: number): Promise<ArticleForList[]> => {
	try {
		let query = `
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
			const [rows] = await pool.query<HomepagePreviewRow[]>(query, [limit]);
			return parseArticleRows(rows);
		}

		const [rows] = await pool.query<HomepagePreviewRow[]>(query);
		return parseArticleRows(rows);
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés :", err);
		throw err;
	}
};

// Récupère un article publié par son ID, avec le content complet et l'image featured.
// Utilisé pour l'affichage public d'un article par ID (uniquement si status = 'published').
const findPublishedById = async (id: number): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.status = 'published' AND a.id = ?`,
			[id],
		);
		return article[0] || null;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par ID :",
			err,
		);
		throw err;
	}
};

// Récupère un article publié par son slug, avec le content complet et l'image featured.
// Utilisé pour afficher un article individuel publié via son URL-friendly slug (affichage public).
// Retourne Article | null (avec content et image_path) uniquement si l'article est publié.
// Combine le filtrage par slug ET par statut 'published' pour la sécurité publique.
// ATTENTION : Cette fonction garantit qu'aucun article non publié ne sera accessible publiquement.
const findPublishedBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.content, a.status, a.user_id, 
              a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id,
              i.path as image_path
      FROM articles a
      LEFT JOIN images i ON a.featured_image_id = i.id
      WHERE a.status = 'published' AND a.slug = ?`,
			[slug],
		);
		return article[0] || null;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération de l'article publié par slug :",
			err,
		);
		throw err;
	}
};

/**
 * Récupère les 4 derniers articles publiés pour la preview homepage
 * Optimisé spécifiquement pour le composant ArticlesPreview de la homepage.
 * Réutilise findPublished avec limit=4.
 *
 * @returns Promise<ArticleForList[]> - 4 articles maximum avec image et tags
 */
const findHomepagePreview = async (): Promise<ArticleForList[]> => {
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
