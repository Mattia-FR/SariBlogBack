import pool from "./db";
import type { Article } from "../types/articles";
import { buildImageUrl } from "../utils/imageUrl";
import { toDateString } from "../utils/dateHelpers";

// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.

const findPublished = async (): Promise<Article[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [articles]: any = await pool.query(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.status = 'published'
			ORDER BY a.published_at DESC`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT at.article_id, t.id, t.name, t.slug
			FROM articles_tags at
			LEFT JOIN tags t ON at.tag_id = t.id`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return articles.map((article: any) => ({
			id: article.id,
			title: article.title,
			slug: article.slug,
			excerpt: article.excerpt,
			status: article.status,
			user_id: article.user_id,
			created_at: toDateString(article.created_at) ?? "",
			updated_at: toDateString(article.updated_at) ?? "",
			published_at: toDateString(article.published_at) ?? null,
			views: article.views,
			featured_image_id: article.featured_image_id,
			imageUrl: buildImageUrl(article.image_path),
			tags: tags
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.filter((t: any) => t.article_id === article.id)
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findPublishedById = async (id: number): Promise<Article | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT a.*, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.status = 'published' AND a.id = ?`,
			[id],
		);

		if (!rows[0]) return null;

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT t.id, t.name, t.slug
			FROM articles_tags at
			LEFT JOIN tags t ON at.tag_id = t.id
			WHERE at.article_id = ?`,
			[id],
		);

		const article = rows[0];

		return {
			id: article.id,
			title: article.title,
			slug: article.slug,
			excerpt: article.excerpt,
			content: article.content,
			status: article.status,
			user_id: article.user_id,
			created_at: toDateString(article.created_at) ?? "",
			updated_at: toDateString(article.updated_at) ?? "",
			published_at: toDateString(article.published_at) ?? null,
			views: article.views,
			featured_image_id: article.featured_image_id,
			imageUrl: buildImageUrl(article.image_path),
			tags: tags,
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findPublishedBySlug = async (slug: string): Promise<Article | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT a.*, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.status = 'published' AND a.slug = ?`,
			[slug],
		);

		if (!rows[0]) return null;

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT t.id, t.name, t.slug
			FROM articles_tags at
			LEFT JOIN tags t ON at.tag_id = t.id
			WHERE at.article_id = ?`,
			[rows[0].id],
		);

		const article = rows[0];

		return {
			id: article.id,
			title: article.title,
			slug: article.slug,
			excerpt: article.excerpt,
			content: article.content,
			status: article.status,
			user_id: article.user_id,
			created_at: toDateString(article.created_at) ?? "",
			updated_at: toDateString(article.updated_at) ?? "",
			published_at: toDateString(article.published_at) ?? null,
			views: article.views,
			featured_image_id: article.featured_image_id,
			imageUrl: buildImageUrl(article.image_path),
			tags: tags,
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findHomepagePreview = async (): Promise<Article[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [articles]: any = await pool.query(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.status = 'published'
			ORDER BY a.published_at DESC
			LIMIT 4`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [tags]: any = await pool.query(
			`SELECT at.article_id, t.id, t.name, t.slug
			FROM articles_tags at
			LEFT JOIN tags t ON at.tag_id = t.id`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return articles.map((article: any) => ({
			id: article.id,
			title: article.title,
			slug: article.slug,
			excerpt: article.excerpt,
			status: article.status,
			user_id: article.user_id,
			created_at: toDateString(article.created_at) ?? "",
			updated_at: toDateString(article.updated_at) ?? "",
			published_at: toDateString(article.published_at) ?? null,
			views: article.views,
			featured_image_id: article.featured_image_id,
			imageUrl: buildImageUrl(article.image_path),
			tags: tags
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.filter((t: any) => t.article_id === article.id)
				// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
				.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default {
	findPublished,
	findPublishedById,
	findPublishedBySlug,
	findHomepagePreview,
};
