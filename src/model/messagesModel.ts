import type { ResultSetHeader } from "mysql2/promise";
import type { Message, MessageCreateData } from "../types/messages";
import { toDateString } from "../utils/dateHelpers";
import pool from "./db";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Message.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const create = async (data: MessageCreateData): Promise<Message> => {
	const [result] = await pool.query<ResultSetHeader>(
		`INSERT INTO messages (firstname, lastname, email, ip, subject, text)
		VALUES (?, ?, ?, ?, ?, ?)`,
		[
			data.firstname ?? null,
			data.lastname ?? null,
			data.email,
			data.ip ?? null,
			data.subject,
			data.text,
		],
	);

	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [rows]: any = await pool.query(
		`SELECT id, firstname, lastname, email, ip, subject, \`text\`, status, created_at
		 FROM messages WHERE id = ?`,
		[result.insertId],
	);
	const row = rows[0];
	if (!row) {
		throw new Error("Impossible de récupérer le message créé");
	}
	return {
		id: row.id,
		firstname: row.firstname,
		lastname: row.lastname,
		email: row.email,
		ip: row.ip,
		subject: row.subject,
		text: row.text,
		status: row.status,
		created_at: toDateString(row.created_at) ?? "",
	};
};

export default {
	create,
};
