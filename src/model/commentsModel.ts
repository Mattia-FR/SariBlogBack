import pool from "./db";
import type { ResultSetHeader } from "mysql2/promise";
import type { Comment, CommentCreateData } from "../types/comments";
import { toDateString } from "../utils/dateHelpers";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Comment.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findApprovedByArticleId = async (id: number): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT c.id, c.text, c.created_at, c.user_id,
			 u.username,
			 u.avatar,
			 COALESCE(u.firstname, c.firstname) AS firstname,
			 COALESCE(u.lastname, c.lastname) AS lastname
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.article_id = ? AND c.status = 'approved'
			ORDER BY c.created_at DESC`,
			[id],
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((comment: any) => ({
			id: comment.id,
			text: comment.text,
			created_at: toDateString(comment.created_at) ?? "",
			user_id: comment.user_id,
			username: comment.username ?? null,
			avatar: comment.avatar ?? null,
			firstname: comment.firstname ?? null,
			lastname: comment.lastname ?? null,
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const create = async (
	data: CommentCreateData,
): Promise<{ id: number; created_at: string }> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO comments (text, user_id, article_id, firstname, lastname, email) VALUES (?, ?, ?, ?, ?, ?)",
			[
				data.text,
				data.user_id ?? null,
				data.article_id,
				data.firstname ?? null,
				data.lastname ?? null,
				data.email ?? null,
			],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT id, created_at FROM comments WHERE id = ?",
			[result.insertId],
		);
		const row = rows[0];
		return {
			id: row.id,
			created_at: toDateString(row.created_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default {
	findApprovedByArticleId,
	create,
};
