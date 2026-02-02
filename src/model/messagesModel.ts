/**
 * Modèle des messages (formulaire de contact).
 * Gère la lecture (admin), création (public), mise à jour du statut, suppression.
 * Convertit les lignes BDD (Date) en Message (created_at en string).
 */
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
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par les requêtes SELECT.
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

// ========================================
// HELPERS
// ========================================

/** Convertit une row en Message (created_at en string). */
function rowToMessage(row: MessageRow): Message {
	return {
		...row,
		created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
	};
}

// ========================================
// FONCTIONS
// ========================================

// Récupère tous les messages (admin). Tri par created_at DESC. Retourne Message[] (created_at string).
const findAll = async (): Promise<Message[]> => {
	try {
		const [rows] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages ORDER BY created_at DESC",
		);
		return rows.map(rowToMessage);
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les messages :", err);
		throw err;
	}
};

// Récupère les messages par statut (admin). Retourne Message[] (created_at string).
const findByStatus = async (
	status: "unread" | "read" | "archived",
): Promise<Message[]> => {
	try {
		const [rows] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC",
			[status],
		);
		return rows.map(rowToMessage);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des messages par statut :",
			err,
		);
		throw err;
	}
};

// Récupère un message par ID (admin). Retourne Message | null (created_at string).
const findById = async (id: number): Promise<Message | null> => {
	try {
		const [rows] = await pool.query<MessageRow[]>(
			"SELECT * FROM messages WHERE id = ?",
			[id],
		);
		if (!rows[0]) return null;
		return rowToMessage(rows[0]);
	} catch (err) {
		console.error("Erreur lors de la récupération du message par ID :", err);
		throw err;
	}
};

// Crée un nouveau message (formulaire de contact). Retourne Message (created_at string).
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

// Met à jour le statut d'un message (admin). Retourne Message | null (created_at string).
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

// Supprime un message par ID (admin). Retourne true si supprimé.
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
