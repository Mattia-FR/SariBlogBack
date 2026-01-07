import pool from "./db";
// ArticleRow est un type qui représente une ligne de résultat d'une requête SELECT.
// Article contient tous les champs incluant le content (LONGTEXT).
// ArticleListItem est une version allégée sans content pour optimiser les listes.
import type {
	Article,
	ArticleRow,
	ArticleListItem,
	ArticleForList,
	HomepagePreviewRow,
} from "../types/articles";
import type { TagForList } from "../types/tags";

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

// Récupère un article par son ID, avec le content complet.
// Utilisé pour afficher un article individuel.
// Retourne Article | null (avec content) pour afficher l'article complet.
const findById = async (id: number): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE id = ?`,
			[id],
		);
		return article[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'article par ID :", err);
		throw err;
	}
};

// Récupère un article par son slug, avec le content complet.
// Utilisé pour afficher un article individuel via son URL-friendly slug (admin ou preview).
// Retourne Article | null (avec content) pour afficher l'article complet.
// ATTENTION : Ne filtre pas par statut, peut retourner des articles non publiés.
// Pour l'affichage public, utiliser findPublishedBySlug à la place.
const findBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE slug = ?`,
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

// Récupère tous les articles publiés (status = 'published'), sans le content.
// Utilisé pour les listes d'articles publiques (page d'accueil, liste des articles).
// Retourne un tableau de ArticleListItem (sans content LONGTEXT) pour optimiser les performances.
// Ne retourne que les articles avec le statut 'published'.
// @param limit - Nombre maximum d'articles à retourner (optionnel). Si non fourni, retourne tous les articles.
const findPublished = async (limit?: number): Promise<ArticleListItem[]> => {
	try {
		let query = `SELECT id, title, slug, excerpt, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE status = 'published'
      ORDER BY published_at DESC`;

		if (limit !== undefined && limit > 0) {
			query += " LIMIT ?";
			const [articles] = await pool.query<ArticleRow[]>(query, [limit]);
			return articles;
		}

		const [articles] = await pool.query<ArticleRow[]>(query);
		return articles;
	} catch (err) {
		console.error("Erreur lors de la récupération des articles publiés :", err);
		throw err;
	}
};

// Récupère un article publié par son slug, avec le content complet.
// Utilisé pour afficher un article individuel publié via son URL-friendly slug (affichage public).
// Retourne Article | null (avec content) uniquement si l'article est publié.
// Combine le filtrage par slug ET par statut 'published' pour la sécurité publique.
// ATTENTION : Cette fonction garantit qu'aucun article non publié ne sera accessible publiquement.
const findPublishedBySlug = async (slug: string): Promise<Article | null> => {
	try {
		const [article] = await pool.query<ArticleRow[]>(
			`SELECT id, title, slug, excerpt, content, status, user_id, 
              created_at, updated_at, published_at, views, featured_image_id 
      FROM articles 
      WHERE status = 'published' AND slug = ?`,
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
 * Récupère les 4 derniers articles publiés avec leurs détails complets (image + tags)
 * Optimisé spécifiquement pour le composant ArticlesPreview de la homepage.
 *
 * Utilise des JOINs pour récupérer toutes les données en une seule requête SQL.
 * Les tags sont agrégés avec GROUP_CONCAT et parsés côté application.
 *
 * @returns Promise<ArticleForList[]> - 4 articles maximum avec image et tags
 */
const findHomepagePreview = async (): Promise<ArticleForList[]> => {
	try {
		const query = `
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
			LIMIT 4
		`;

		const [rows] = await pool.query<HomepagePreviewRow[]>(query);

		// URL de base pour les images (à configurer via variable d'environnement en production)
		const IMAGE_BASE_URL =
			process.env.IMAGE_BASE_URL || "http://localhost:4242";

		// Parser les résultats pour construire les objets ArticleForList
		return rows.map((row) => {
			// Construire le tableau de tags depuis le GROUP_CONCAT
			const tags: TagForList[] = row.tags
				? row.tags.split("|").map((tagStr) => {
						const [id, name, slug] = tagStr.split(":");
						return {
							id: Number.parseInt(id, 10),
							name,
							slug,
							// created_at optionnel, non utilisé pour l'affichage
						} as TagForList;
					})
				: [];

			// Construire l'URL complète de l'image si elle existe
			const imageUrl = row.image_path
				? `${IMAGE_BASE_URL}${row.image_path}`
				: undefined;

			// Retourner l'article enrichi
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
				imageUrl,
				tags,
			} as ArticleForList;
		});
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des articles pour la homepage :",
			err,
		);
		throw err;
	}
};

export default {
	findAll,
	findById,
	findBySlug,
	findPublished,
	findPublishedBySlug,
	findHomepagePreview,
};
