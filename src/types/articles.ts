import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table articles en base de données.
// Extends RowDataPacket pour être compatible avec mysql2/promise.
export interface ArticleRow extends RowDataPacket {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string;
	status: "draft" | "published" | "archived";
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
}

// Interface pour un article complet (avec le content).
// Utilisée pour afficher un article individuel.
export interface Article extends ArticleRow {}

// Interface pour un article dans une liste (sans le content LONGTEXT).
// Utilisée pour les listes d'articles où on n'affiche que l'excerpt.
export interface ArticleListItem extends Omit<ArticleRow, "content"> {}

// Interface pour le résultat de la requête findHomepagePreview
// Représente une ligne brute avec les données enrichies (image + tags agrégés)
export interface HomepagePreviewRow extends RowDataPacket {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	status: "draft" | "published" | "archived";
	user_id: number;
	created_at: Date;
	updated_at: Date;
	published_at: Date | null;
	views: number;
	featured_image_id: number | null;
	image_path: string | null;
	tags: string | null; // Format: "id:name:slug|id:name:slug"
}

// Interface pour un article enrichi avec image et tags (utilisée pour la homepage)
// Extends ArticleListItem et ajoute les données enrichies
export interface ArticleForList extends ArticleListItem {
	imageUrl?: string;
	tags?: Array<{
		id: number;
		name: string;
		slug: string;
		created_at?: Date; // Optionnel car non utilisé pour l'affichage
	}>;
}
