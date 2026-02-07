import pool from "../db";
import type {
	Article,
	ArticleCreateData,
	ArticleUpdateData,
} from "../../types/articles";
import type { ResultSetHeader } from "mysql2/promise";
import { buildImageUrl } from "../../utils/imageUrl";

// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.

function toDateString(value: Date | string | null): string | null {
	if (!value) return null;
	return value instanceof Date
		? value.toISOString()
		: new Date(value).toISOString();
}

const findAllForAdmin = async (): Promise<Article[]> => {
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
		...article,
		imageUrl: buildImageUrl(article.image_path),
		tags: tags
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			.filter((t: any) => t.article_id === article.id)
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })),
		created_at: toDateString(article.created_at),
		updated_at: toDateString(article.updated_at),
		published_at: toDateString(article.published_at),
	}));
};

const findByIdForAdmin = async (id: number): Promise<Article | null> => {
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
		...article,
		imageUrl: buildImageUrl(article.image_path),
		tags: tags,
		created_at: toDateString(article.created_at),
		updated_at: toDateString(article.updated_at),
		published_at: toDateString(article.published_at),
	};
};

const create = async (data: ArticleCreateData): Promise<Article> => {
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [result]: any = await pool.query(
		"INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
		[
			data.title,
			data.slug,
			data.excerpt,
			data.content,
			data.status,
			data.user_id,
			data.featured_image_id,
		],
	);

	return {
		id: result.insertId,
		...data,
		status: data.status ?? "draft",
		views: 0,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		published_at: data.published_at ? toDateString(data.published_at) : null,
		imageUrl: buildImageUrl(
			data.featured_image_id ? `/images/${data.featured_image_id}` : null,
		),
		tags: [],
		excerpt: data.excerpt ?? null,
		featured_image_id: data.featured_image_id ?? null,
	};
};

const update = async (
	id: number,
	data: ArticleUpdateData,
): Promise<Article | null> => {
	// On ne garde que les champs autorisés à être mis à jour
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

	if (updates.length === 0) {
		throw new Error("Aucun champ à mettre à jour");
	}

	values.push(id);

	const query = `UPDATE articles SET ${updates.join(", ")} WHERE id = ?`;

	const [result] = await pool.query<ResultSetHeader>(query, values);

	if (result.affectedRows === 0) {
		return null;
	}

	// Récupère l'article mis à jour pour être sûr de renvoyer un Article complet
	const updatedArticle = await findByIdForAdmin(id);
	return updatedArticle;
};

const deleteOne = async (id: number): Promise<boolean> => {
	const [result] = await pool.query<ResultSetHeader>(
		"DELETE FROM articles WHERE id = ?",
		[id],
	);
	return result.affectedRows > 0;
};

export default {
	findAllForAdmin,
	findByIdForAdmin,
	create,
	update,
	deleteOne,
};
