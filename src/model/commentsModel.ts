import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type { Comment } from "../types/comments";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================

// Type pour les lignes retournées par les requêtes avec JOIN users
interface CommentRowFromQuery extends RowDataPacket {
	id: number;
	text: string;
	created_at: Date;
	// Infos de l'utilisateur (via JOIN)
	user_id: number;
	username: string;
	avatar: string | null;
	firstname: string | null;
	lastname: string | null;
}

const findApprovedByArticleId = async (id: number): Promise<Comment[]> => {
  try {
    const [comments] = await pool.query<CommentRowFromQuery[]>(
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
    return comments;
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