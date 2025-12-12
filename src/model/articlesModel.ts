import pool from "./db";
// ArticleRow est un type qui représente une ligne de résultat d'une requête SELECT.
// Article contient tous les champs incluant le content (LONGTEXT).
// ArticleListItem est une version allégée sans content pour optimiser les listes.
import type { Article, ArticleRow, ArticleListItem } from "../types/articles";

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
		console.error("Erreur lors de la récupération de tous les articles:", err);
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
		console.error("Erreur lors de la récupération de l'article par ID:", err);
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
		console.error("Erreur lors de la récupération de l'article par slug:", err);
		throw err;
	}
};

// Récupère tous les articles publiés (status = 'published'), sans le content.
// Utilisé pour les listes d'articles publiques (page d'accueil, liste des articles).
// Retourne un tableau de ArticleListItem (sans content LONGTEXT) pour optimiser les performances.
// Ne retourne que les articles avec le statut 'published'.
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
		console.error("Erreur lors de la récupération des articles publiés:", err);
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
		console.error("Erreur lors de la récupération de l'article publié par slug:", err);
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
