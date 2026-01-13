// ========================================
// TYPES PUBLICS pour les images
// ========================================

// Interface pour une image complète avec tous les champs.
// Utilisée pour afficher une image individuelle ou dans la galerie.
export interface Image {
	id: number;
	title: string | null;
	description: string | null;
	path: string;
	alt_descr: string | null;
	is_in_gallery: boolean;
	user_id: number;
	article_id: number | null;
	created_at: Date;
	updated_at: Date;
}

// Interface pour une image dans le contexte d'un article (version allégée).
// Sans description complète (pas nécessaire pour les images illustrant un article).
export interface ImageForArticle {
	id: number;
	title: string | null;
	path: string;
	alt_descr: string | null;
	article_id: number | null;
}

// Interface pour une image enrichie avec tags (utilisée pour la galerie).
export interface ImageForList extends Image {
	tags?: Array<{
		id: number;
		name: string;
		slug: string;
	}>;
}