import pool from "../db";
import type {
	Article,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";
import type { ResultSetHeader } from "mysql2/promise";
import { buildImageUrl } from "../../utils/imageUrl";
import { buildSlug } from "../../utils/slug";
import { toDateString } from "../../utils/dateHelpers";
import logger from "../../utils/logger";

// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.

const findAllForAdmin = async (): Promise<Article[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [articles]: any = await pool.query(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			ORDER BY a.created_at DESC`,
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
		logger.error(err);
		throw err;
	}
};

/** Liste admin paginée (tous statuts), optionnellement filtrée par tag. */
const findAllForAdminPaginated = async (
	page: number,
	limit: number,
	tagId?: number,
): Promise<{ articles: Article[]; total: number }> => {
	const offset = (page - 1) * limit;

	try {
		const tagFilter =
			tagId != null
				? "INNER JOIN articles_tags filt ON filt.article_id = a.id AND filt.tag_id = ?"
				: "";

		const listParams = tagId != null ? [tagId, limit, offset] : [limit, offset];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [articles]: any = await pool.query(
			`SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			${tagFilter}
			ORDER BY a.created_at DESC
			LIMIT ? OFFSET ?`,
			listParams,
		);

		const countParams = tagId != null ? [tagId] : [];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [countResult]: any = await pool.query(
			tagId != null
				? `SELECT COUNT(DISTINCT a.id) as total
				FROM articles a
				INNER JOIN articles_tags filt ON filt.article_id = a.id AND filt.tag_id = ?`
				: "SELECT COUNT(*) as total FROM articles",
			countParams,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		let tags: any[] = [];
		if (articles.length > 0) {
			const articleIds: number[] = articles.map(
				(row: { id: number }) => row.id,
			);
			const placeholders = articleIds.map(() => "?").join(",");
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			const [tagRows]: any = await pool.query(
				`SELECT at.article_id, t.id, t.name, t.slug
				FROM articles_tags at
				LEFT JOIN tags t ON at.tag_id = t.id
				WHERE at.article_id IN (${placeholders})`,
				articleIds,
			);
			tags = tagRows;
		}

		return {
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			articles: articles.map((article: any) => ({
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
			})),
			total: countResult[0].total,
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByIdForAdmin = async (id: number): Promise<Article | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT a.*, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.id = ?`,
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
		logger.error(err);
		throw err;
	}
};

const findBySlugForAdmin = async (slug: string): Promise<Article | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT a.*, i.path as image_path
			FROM articles a
			LEFT JOIN images i ON a.featured_image_id = i.id
			WHERE a.slug = ?`,
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
		logger.error(err);
		throw err;
	}
};

const create = async (data: ArticleCreateData): Promise<Article> => {
	try {
		const slug = data.slug ?? buildSlug(data.title);
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
			[
				data.title,
				slug,
				data.excerpt,
				data.content,
				data.status,
				data.user_id,
				data.featured_image_id,
			],
		);
		const articleId = result.insertId;

		const tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
		if (tagIds.length > 0) {
			const values = tagIds.map((tagId) => [articleId, tagId]);
			await pool.query(
				"INSERT INTO articles_tags (article_id, tag_id) VALUES ?",
				[values],
			);
		}

		return {
			id: articleId,
			title: data.title,
			slug,
			excerpt: data.excerpt ?? null,
			content: data.content,
			status: data.status ?? "draft",
			user_id: data.user_id,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			published_at: data.published_at ? toDateString(data.published_at) : null,
			views: 0,
			featured_image_id: data.featured_image_id ?? null,
			imageUrl: buildImageUrl(
				data.featured_image_id ? `/images/${data.featured_image_id}` : null,
			),
			tags: [],
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const update = async (
	id: number,
	data: ArticleUpdateData,
): Promise<Article | null> => {
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
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const values: any[] = [];

		for (const field of allowedFields) {
			if (field in data) {
				updates.push(`${field} = ?`);
				values.push(data[field as keyof ArticleUpdateData]);
			}
		}

		const hasTagIds = "tag_ids" in data;
		if (updates.length === 0 && !hasTagIds) {
			throw new Error("Aucun champ à mettre à jour");
		}

		if (updates.length > 0) {
			values.push(id);
			const query = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;
			const [result] = await pool.query<ResultSetHeader>(query, values);
			if (result.affectedRows === 0) {
				return null;
			}
		}

		if (hasTagIds) {
			const tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
			await pool.query("DELETE FROM articles_tags WHERE article_id = ?", [id]);
			if (tagIds.length > 0) {
				const tagValues = tagIds.map((tagId) => [id, tagId]);
				await pool.query(
					"INSERT INTO articles_tags (article_id, tag_id) VALUES ?",
					[tagValues],
				);
			}
		}

		const updatedArticle = await findByIdForAdmin(id);
		return updatedArticle;
	} catch (err) {
		logger.error(err);
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
		logger.error(err);
		throw err;
	}
};

const countAll = async (): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM articles",
		);
		return rows[0].total;
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const countByStatus = async (status: string): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM articles WHERE status = ?",
			[status],
		);
		return rows[0].total;
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export default {
	findAllForAdmin,
	findAllForAdminPaginated,
	findByIdForAdmin,
	findBySlugForAdmin,
	create,
	update,
	deleteOne,
	countAll,
	countByStatus,
};
