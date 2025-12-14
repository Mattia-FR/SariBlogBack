import pool from "./db";
import type { Comment, CommentRowFromQuery } from "../types/comments";

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