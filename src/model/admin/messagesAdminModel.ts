import pool from "../db";
import type { ResultSetHeader } from "mysql2/promise";
import type { Message, MessageUpdateData } from "../../types/messages";
import { toDateString } from "../../utils/dateHelpers";

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
			...row,
			created_at: toDateString(row.created_at) ?? "",
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const findByStatus = async (
	status: "unread" | "read" | "archived",
): Promise<Message[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC",
			[status],
		);
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((row: any) => ({
			...row,
			created_at: toDateString(row.created_at) ?? "",
		}));
	} catch (err) {
		console.error(err);
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
			...row,
			created_at: toDateString(row.created_at) ?? "",
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const updateStatus = async (
	id: number,
	data: MessageUpdateData,
): Promise<Message | null> => {
	try {
		const { status } = data;
		if (status == null || !["unread", "read", "archived"].includes(status)) {
			throw new Error("Statut invalide ou manquant");
		}
		const [result] = await pool.query<ResultSetHeader>(
			"UPDATE messages SET status = ? WHERE id = ?",
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
			"DELETE FROM messages WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
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
};
