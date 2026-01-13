// ========================================
// TYPES PUBLICS pour les tags
// ========================================

// Interface pour un tag complet
export interface Tag {
	id: number;
	name: string;
	slug: string;
	created_at: Date;
}

// Interface pour un tag dans une liste (version allégée).
// Utilisée pour les articles et images enrichis avec tags.
export interface TagForList {
	id: number;
	name: string;
	slug: string;
}