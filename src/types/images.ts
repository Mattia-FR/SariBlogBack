import type { Tag } from "./tags";

export interface Image {
	id: number;
	title: string | null;
	description: string | null;
	path: string;
	alt_descr: string | null;
	is_in_gallery: boolean;
	user_id: number;
	article_id: number | null;
	created_at: string;
	updated_at: string;
	tags?: Tag[];
}

/** Données pour créer une image (path et user_id requis). */
export interface ImageCreateData {
	path: string;
	user_id: number;
	title?: string | null;
	description?: string | null;
	alt_descr?: string | null;
	is_in_gallery?: boolean;
	article_id?: number | null;
}

/** Données partielles pour mettre à jour une image. */
export interface ImageUpdateData {
	title?: string | null;
	description?: string | null;
	path?: string;
	alt_descr?: string | null;
	is_in_gallery?: boolean;
	article_id?: number | null;
}
