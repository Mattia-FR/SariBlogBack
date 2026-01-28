// ========================================
// TYPES PUBLICS pour les articles
// ========================================
// Ces types sont exportés et utilisés dans les controllers et le frontend

// Type pour le statut d'un article
export type ArticleStatus = "draft" | "published" | "archived";

// Interface pour un article complet (avec le content).
// Utilisée pour afficher un article individuel.
// Peut inclure image_path si récupéré via JOIN avec la table images.
export interface Article {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	status: ArticleStatus;
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
	image_path?: string | null; // Chemin relatif de l'image featured (via JOIN)
}

// Interface pour un article dans une liste (sans le content LONGTEXT pour optimisation).
// Utilisée pour les listes d'articles où on n'affiche que l'excerpt.
export interface ArticleListItem {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	status: ArticleStatus;
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
}

// Interface pour un article enrichi avec image et tags (utilisée pour les listes publiques).
// Le model retourne image_path (chemin relatif), le controller le transforme en imageUrl (URL complète).
export interface ArticleForList extends ArticleListItem {
	image_path?: string;
	tags?: Array<{
		id: number;
		name: string;
		slug: string;
	}>;
}

// Interface spécifique pour l'administration avec infos supplémentaires
export interface ArticleForAdmin extends ArticleForList {
	comments_count?: number;
}

// Interface pour un article complet côté admin (avec content + infos admin)
export interface ArticleAdmin extends Article {
	tags?: Array<{
		id: number;
		name: string;
		slug: string;
	}>;
	comments_count?: number;
}

export interface ArticleCreateData {
	title: string;
	slug: string;
	content: string;
	excerpt?: string | null;
	status?: "draft" | "published" | "archived";
	user_id: number;
	featured_image_id?: number | null;
	published_at?: Date | null;
	views?: number;
}

export interface ArticleUpdateData {
	title?: string;
	slug?: string;
	excerpt?: string | null;
	content?: string;
	status?: "draft" | "published" | "archived";
	featured_image_id?: number | null;
	published_at?: Date | null;
}
