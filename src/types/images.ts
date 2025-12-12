import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table images en base de données.
// Extends RowDataPacket pour être compatible avec mysql2/promise.
export interface ImageRow extends RowDataPacket {
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

// Interface pour une image complète.
// Utilisée pour afficher une image individuelle ou dans la galerie (où on veut toutes les infos).
export interface Image extends ImageRow {}

// Interface pour une image dans le contexte d'un article.
// Version légère sans description (pas nécessaire pour les images illustrant un article).
// Utilisée pour les listes d'images associées à un article.
export interface ImageForArticle
	extends Omit<
		ImageRow,
		"description" | "is_in_gallery" | "user_id" | "created_at" | "updated_at"
	> {}
