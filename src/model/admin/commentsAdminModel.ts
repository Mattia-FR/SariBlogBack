import pool from "../db";
import type { ResultSetHeader } from "mysql2/promise";
import type {
	Comment,
	CommentStatus,
	CommentUpdateData,
} from "../../types/comments";
import { toDateString } from "../../utils/dateHelpers";
import logger from "../../utils/logger";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString) et au mapping explicite après jointure users, le frontend reçoit toujours des objets strictement conformes à l'interface Comment.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findAll = async (): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT
				c.id,
				c.text,
				c.created_at,
				c.status,
				c.user_id,
				u.username,
				u.avatar,
				u.firstname   AS user_firstname,
				u.lastname    AS user_lastname,
				c.firstname   AS guest_firstname,
				c.lastname    AS guest_lastname,
				c.email
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			ORDER BY c.created_at DESC`,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => {
			const firstname =
				row.user_firstname != null && row.user_firstname !== ""
					? row.user_firstname
					: row.guest_firstname ?? null;

			const lastname =
				row.user_lastname != null && row.user_lastname !== ""
					? row.user_lastname
					: row.guest_lastname ?? null;

			return {
				id: row.id,
				text: row.text,
				created_at: toDateString(row.created_at) ?? "",
				status: row.status,
				user_id: row.user_id,
				username: row.username ?? null,
				avatar: row.avatar ?? null,
				firstname,
				lastname,
				email: row.email ?? null,
			};
		});
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByStatus = async (status: CommentStatus): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT
				c.id,
				c.text,
				c.created_at,
				c.status,
				c.user_id,
				u.username,
				u.avatar,
				u.firstname   AS user_firstname,
				u.lastname    AS user_lastname,
				c.firstname   AS guest_firstname,
				c.lastname    AS guest_lastlastname,
				c.email
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.status = ?
			ORDER BY c.created_at DESC`,
			[status],
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => {
			const firstname =
				row.user_firstname != null && row.user_firstname !== ""
					? row.user_firstname
					: row.guest_firstname ?? null;

			const lastname =
				row.user_lastname != null && row.user_lastname !== ""
					? row.user_lastname
					: row.guest_lastlastname ?? null;

			return {
				id: row.id,
				text: row.text,
				created_at: toDateString(row.created_at) ?? "",
				status: row.status,
				user_id: row.user_id,
				username: row.username ?? null,
				avatar: row.avatar ?? null,
				firstname,
				lastname,
				email: row.email ?? null,
			};
		});
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<Comment | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT
				c.id,
				c.text,
				c.created_at,
				c.status,
				c.user_id,
				u.username,
				u.avatar,
				u.firstname   AS user_firstname,
				u.lastname    AS user_lastname,
				c.firstname   AS guest_firstname,
				c.lastname    AS guest_lastname,
				c.email
			FROM comments c
			LEFT JOIN users u ON c.user_id = u.id
			WHERE c.id = ?`,
			[id],
		);
		if (!rows[0]) return null;
		const row = rows[0];

		const firstname =
			row.user_firstname != null && row.user_firstname !== ""
				? row.user_firstname
				: row.guest_firstname ?? null;

		const lastname =
			row.user_lastname != null && row.user_lastname !== ""
				? row.user_lastname
				: row.guest_lastname ?? null;

		return {
			id: row.id,
			text: row.text,
			created_at: toDateString(row.created_at) ?? "",
			status: row.status,
			user_id: row.user_id,
			username: row.username ?? null,
			avatar: row.avatar ?? null,
			firstname,
			lastname,
			email: row.email ?? null,
		};
	} catch (err) {
		logger.error(err);
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
		logger.error(err);
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
		logger.error(err);
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
		logger.error(err);
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
