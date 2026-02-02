/**
 * Modèle des commentaires.
 * Gère la lecture des commentaires approuvés par article (avec infos utilisateur en JOIN).
 * Convertit les lignes BDD (Date) en Comment (created_at en string).
 */
import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type { Comment } from "../types/comments";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================
// Ces types avec RowDataPacket sont uniquement pour mysql2 et restent internes au model.

// Type pour les lignes retournées par la requête avec JOIN users.
interface CommentRowFromQuery extends RowDataPacket {
	id: number;
	text: string;
	created_at: Date;
	user_id: number;
	username: string;
	avatar: string | null;
	firstname: string | null;
	lastname: string | null;
}

// ========================================
// HELPERS
// ========================================

/** Convertit une row en Comment (created_at en string). */
function rowToComment(row: CommentRowFromQuery): Comment {
	return {
		id: row.id,
		text: row.text,
		created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
		user_id: row.user_id,
		username: row.username,
		avatar: row.avatar,
		firstname: row.firstname,
		lastname: row.lastname,
	};
}

// ========================================
// FONCTIONS
// ========================================

// Récupère les commentaires approuvés d'un article (avec infos user via JOIN). Retourne Comment[] (created_at string).
const findApprovedByArticleId = async (id: number): Promise<Comment[]> => {
	try {
		const [rows] = await pool.query<CommentRowFromQuery[]>(
			`SELECT 
        c.id, 
        c.text, 
        c.created_at,
        u.id as user_id,
        u.username,
        u.avatar,
        u.firstname,
        u.lastname
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ? AND c.status = 'approved'
      ORDER BY c.created_at DESC`,
			[id],
		);
		return rows.map(rowToComment);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des commentaires approuvés par ID d'article :",
			err,
		);
		throw err;
	}
};

export default {
	findApprovedByArticleId,
};
