import pool from "../db";
import type { ResultSetHeader } from "mysql2/promise";
import type {
	Message,
	MessageUpdateData,
	MessageStatus,
} from "../../types/messages";
import { toDateString } from "../../utils/dateHelpers";
import logger from "../../utils/logger";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Message.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findAll = async (): Promise<Message[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM messages ORDER BY created_at DESC",
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			firstname: row.firstname,
			lastname: row.lastname,
			email: row.email,
			username: row.username,
			ip: row.ip,
			subject: row.subject,
			text: row.text,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at) ?? "",
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findByStatus = async (status: MessageStatus): Promise<Message[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC",
			[status],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			id: row.id,
			firstname: row.firstname,
			lastname: row.lastname,
			email: row.email,
			username: row.username,
			ip: row.ip,
			subject: row.subject,
			text: row.text,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at) ?? "",
		}));
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findById = async (id: number): Promise<Message | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM messages WHERE id = ?",
			[id],
		);
		if (!rows[0]) return null;
		const row = rows[0];
		return {
			id: row.id,
			firstname: row.firstname,
			lastname: row.lastname,
			email: row.email,
			username: row.username,
			ip: row.ip,
			subject: row.subject,
			text: row.text,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at) ?? "",
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const updateStatus = async (
	id: number,
	data: MessageUpdateData,
): Promise<Message | null> => {
	try {
		const { status } = data;
		const [result] = await pool.query<ResultSetHeader>(
			"UPDATE messages SET status = ? WHERE id = ?",
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
			"DELETE FROM messages WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const countByStatus = async (status: MessageStatus): Promise<number> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT COUNT(*) as total FROM messages WHERE status = ?",
			[status],
		);
		return rows[0].total;
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

const findAllPaginated = async (
	page: number,
	limit: number,
	status?: MessageStatus,
): Promise<{ messages: Message[]; total: number }> => {
	const offset = (page - 1) * limit;
	const whereClause = status ? "WHERE status = ?" : "";
	const countParams = status ? [status] : [];
	const listParams = status ? [status, limit, offset] : [limit, offset];
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [countResult]: any = await pool.query(
			`SELECT COUNT(*) as total FROM messages ${whereClause}`,
			countParams,
		);
		const total = countResult[0].total as number;

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT * FROM messages ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
			listParams,
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const messages: Message[] = rows.map((row: any) => ({
			id: row.id,
			firstname: row.firstname,
			lastname: row.lastname,
			email: row.email,
			username: row.username,
			ip: row.ip,
			subject: row.subject,
			text: row.text,
			status: row.status,
			user_id: row.user_id,
			created_at: toDateString(row.created_at) ?? "",
		}));

		return { messages, total };
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

/** Totaux pour les onglets (tous statuts confondus). */
const findTabCounts = async (): Promise<{
	total: number;
	unread: number;
	read: number;
	archived: number;
}> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT
				COUNT(*) AS total,
				COALESCE(SUM(status = 'unread'), 0) AS unread,
				COALESCE(SUM(status = 'read'), 0) AS \`read\`,
				COALESCE(SUM(status = 'archived'), 0) AS archived
			FROM messages`,
		);
		const r = rows[0];
		return {
			total: Number(r.total),
			unread: Number(r.unread),
			read: Number(r.read),
			archived: Number(r.archived),
		};
	} catch (err) {
		logger.error(err);
		throw err;
	}
};

export default {
	findAll,
	findAllPaginated,
	findTabCounts,
	findByStatus,
	findById,
	updateStatus,
	deleteOne,
	countByStatus,
};
