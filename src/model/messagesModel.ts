import pool from "./db";
import type { ResultSetHeader } from "mysql2/promise";
import type { Message, MessageCreateData } from "../types/messages";
import messagesAdminModel from "./admin/messagesAdminModel";

const { findById } = messagesAdminModel;

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
		console.error(err);
		throw err;
	}
};

export default {
	create,
};
