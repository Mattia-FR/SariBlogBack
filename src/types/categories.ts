export interface Category {
	id: number;
	name: string;
	slug: string;
	display_order: number;
	created_at: string;
}

export interface CategoryCreateData {
	name: string;
	slug: string;
	display_order: number;
}

/** Données optionnelles pour une mise à jour partielle (PATCH). */
export interface CategoryUpdateData {
	name?: string;
	slug?: string;
	display_order?: number;
}
