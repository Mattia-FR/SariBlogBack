import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table comments en base de données.
export interface CommentRow extends RowDataPacket {
  id: number;
  text: string;
  status: "pending" | "approved" | "rejected" | "spam";
  user_id: number;
  article_id: number;
  created_at: Date;
  updated_at: Date;
}

// Interface représentant le résultat SQL avec JOIN users.
// Correspond exactement aux champs sélectionnés dans findApprovedByArticleId().
export interface CommentRowFromQuery extends RowDataPacket {
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

// Interface pour l'API publique.
// = Même format que CommentRowFromQuery (champs à plat, pas d'objet imbriqué).
export interface Comment extends CommentRowFromQuery {}