import type { Tag } from "./tags";

export type ArticleStatus = "draft" | "published" | "archived";

export interface Article {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content?: string; // Optionnel : pas toujours chargé
	status: ArticleStatus;
	user_id: number;
	created_at: string;
	updated_at: string;
	published_at: string | null;
	views: number;
	featured_image_id: number | null;
	imageUrl?: string; // Optionnel : enrichi côté front
	tags?: Tag[]; // Optionnel : enrichi
}

export interface ArticleCreateData {
	title: string;
	slug: string;
	content: string;
	excerpt?: string | null;
	status?: ArticleStatus;
	user_id: number;
	featured_image_id?: number | null;
	published_at?: string | null;
}

export interface ArticleUpdateData {
	title?: string;
	slug?: string;
	excerpt?: string | null;
	content?: string;
	status?: ArticleStatus;
	featured_image_id?: number | null;
	published_at?: string | null;
}
