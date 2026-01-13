// ========================================
// TYPES PUBLICS pour les commentaires
// ========================================

// Type pour le statut d'un commentaire
export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

// Interface pour un commentaire avec les infos de l'utilisateur (version publique).
// Les infos utilisateur sont à plat (pas d'objet imbriqué) pour optimisation.
export interface Comment {
	id: number;
	text: string;
	created_at: Date;
	// Infos de l'utilisateur (via JOIN users)
	user_id: number;
	username: string;
	avatar: string | null;
	firstname: string | null;
	lastname: string | null;
}