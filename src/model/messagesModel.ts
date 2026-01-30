import pool from "./db";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import type {
	Message,
	MessageCreateData,
	MessageUpdateData,
} from "../types/messages";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================

// Type pour les lignes retournées par les requêtes SELECT
interface MessageRow extends RowDataPacket {
	id: number;
	firstname: string | null;
	lastname: string | null;
	email: string;
	username: string | null;
	ip: string | null;
	subject: string;
	text: string;
	status: "unread" | "read" | "archived";
	user_id: number | null;
	created_at: Date;
}

// Récupère tous les messages (admin)
const findAll = async (): Promise<Message[]> => {
	try {
		const [messages] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages ORDER BY created_at DESC",
		);
		return messages;
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les messages :", err);
		throw err;
	}
};

// Récupère les messages par statut (admin)
const findByStatus = async (
	status: "unread" | "read" | "archived",
): Promise<Message[]> => {
	try {
		const [messages] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC",
			[status],
		);
		return messages;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des messages par statut :",
			err,
		);
		throw err;
	}
};

// Récupère un message par ID (admin)
const findById = async (id: number): Promise<Message | null> => {
	try {
		const [messages] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages WHERE id = ?",
			[id],
		);
		return messages[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération du message par ID :", err);
		throw err;
	}
};

// Crée un nouveau message (public - formulaire de contact)
const create = async (data: MessageCreateData): Promise<Message> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			`INSERT INTO messages (firstname, lastname, email, username, ip, subject, text, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				data.firstname ?? null,
				data.lastname ?? null,
				data.email,
				data.username ?? null,
				data.ip ?? null,
				data.subject,
				data.text,
				data.user_id ?? null,
			],
		);

		const newMessage = await findById(result.insertId);
		if (!newMessage) {
			throw new Error("Impossible de récupérer le message créé");
		}
		return newMessage;
	} catch (err) {
		console.error("Erreur lors de la création du message :", err);
		throw err;
	}
};

// Met à jour le statut d'un message (admin)
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
		console.error("Erreur lors de la mise à jour du statut :", err);
		throw err;
	}
};

// Supprime un message (admin)
const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM messages WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error("Erreur lors de la suppression du message :", err);
		throw err;
	}
};

export default {
	findAll,
	findByStatus,
	findById,
	create,
	updateStatus,
	deleteOne,
};
