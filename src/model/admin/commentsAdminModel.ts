import pool from "../db";
import type { ResultSetHeader } from "mysql2/promise";
import type {
	Comment,
	CommentStatus,
	CommentUpdateData,
} from "../../types/comments";
import { toDateString } from "../../utils/dateHelpers";

const findAll = async (): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT c.id, c.text, c.created_at, c.status, u.id as user_id, u.username, u.avatar, u.firstname, u.lastname
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((comment: any) => ({
			id: comment.id,
			text: comment.text,
			created_at: toDateString(comment.created_at) ?? "",
			status: comment.status,
			user_id: comment.user_id,
			username: comment.username,
			avatar: comment.avatar,
			firstname: comment.firstname,
			lastname: comment.lastname,
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findByStatus = async (status: CommentStatus): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT c.id, c.text, c.created_at, c.status, u.id as user_id, u.username, u.avatar, u.firstname, u.lastname
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
			WHERE c.status = ?
      ORDER BY c.created_at DESC`,
			[status],
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((comment: any) => ({
			id: comment.id,
			text: comment.text,
			created_at: toDateString(comment.created_at) ?? "",
			status: comment.status,
			user_id: comment.user_id,
			username: comment.username,
			avatar: comment.avatar,
			firstname: comment.firstname,
			lastname: comment.lastname,
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<Comment | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT c.id, c.text, c.created_at, c.status, u.id as user_id, u.username, u.avatar, u.firstname, u.lastname
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
			WHERE c.id = ?`,
			[id],
		);
		if (!rows[0]) return null;
		const row = rows[0];
		return {
			id: row.id,
			text: row.text,
			created_at: toDateString(row.created_at) ?? "",
			status: row.status,
			user_id: row.user_id,
			username: row.username,
			avatar: row.avatar,
			firstname: row.firstname,
			lastname: row.lastname,
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const updateStatus = async (
	id: number,
	data: CommentUpdateData,
): Promise<Comment | null> => {
	try {
		const { status } = data;
		if (
			status == null ||
			!["pending", "approved", "rejected", "spam"].includes(status)
		) {
			throw new Error("Statut invalide ou manquant");
		}
		const [result] = await pool.query<ResultSetHeader>(
			"UPDATE comments SET status = ? WHERE id = ?",
			[status, id],
		);

		if (result.affectedRows === 0) {
			return null;
		}

		return findById(id);
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM comments WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const countByStatus = async (status: CommentStatus): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM comments WHERE status = ?",
			[status],
		);
		return rows[0].total;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default {
	findAll,
	findByStatus,
	findById,
	updateStatus,
	deleteOne,
	countByStatus,
};
