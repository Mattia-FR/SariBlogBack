import pool from "./db";
import type { RowDataPacket } from "mysql2/promise";
import type { Image, ImageForArticle, ImageForList } from "../types/images";
import type { TagForList } from "../types/tags";

// ========================================
// TYPES INTERNES (Row) - Ne pas exporter
// ========================================

// Type pour les lignes retournées par les requêtes SELECT simples
interface ImageRow extends RowDataPacket {
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

// Type pour les lignes retournées par findByArticleId (version allégée)
interface ImageForArticleRowFromQuery extends RowDataPacket {
	id: number;
	title: string | null;
	path: string;
	alt_descr: string | null;
	article_id: number | null;
}

// Type pour les lignes retournées par findGallery avec GROUP_CONCAT
interface GalleryRow extends RowDataPacket {
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
	tags: string | null; // Format GROUP_CONCAT: "id:name:slug|id:name:slug"
}

// Récupère toutes les images de la base de données.
// Utilisé pour les listes complètes d'images (admin ou gestion).
// Retourne un tableau de Image avec tous les champs (description, métadonnées, etc.).
const findAll = async (): Promise<Image[]> => {
	try {
		const [images] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images`,
		);
		return images;
	} catch (err) {
		console.error("Erreur lors de la récupération de toutes les images :", err);
		throw err;
	}
};

/**
 * Fonction helper pour parser les rows avec tags
 * Utilisée par findGallery pour transformer les tags GROUP_CONCAT en tableau
 */
function parseImageRows(rows: GalleryRow[]): ImageForList[] {
	return rows.map((row) => {
		// Construire le tableau de tags depuis le GROUP_CONCAT
		const tags: TagForList[] = row.tags
			? row.tags.split("|").map((tagStr) => {
					const [id, name, slug] = tagStr.split(":");
					return {
						id: Number.parseInt(id, 10),
						name,
						slug,
					} as TagForList;
				})
			: [];

		// Retourner l'image avec les tags
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			path: row.path,
			alt_descr: row.alt_descr,
			is_in_gallery: row.is_in_gallery,
			user_id: row.user_id,
			article_id: row.article_id,
			created_at: row.created_at,
			updated_at: row.updated_at,
			tags,
		} as ImageForList;
	});
}

/**
 * Récupère toutes les images de la galerie (is_in_gallery = TRUE) avec leurs tags
 * Utilisé pour afficher la galerie publique d'images.
 * Retourne un tableau de ImageForList avec tags enrichis.
 *
 * @returns Promise<ImageForList[]> - Images de la galerie avec tags
 */
const findGallery = async (): Promise<ImageForList[]> => {
	try {
		const query = `
			SELECT 
				i.id, 
				i.title, 
				i.description, 
				i.path, 
				i.alt_descr, 
				i.is_in_gallery, 
				i.user_id, 
				i.article_id, 
				i.created_at, 
				i.updated_at,
				GROUP_CONCAT(
					DISTINCT CONCAT(t.id, ':', t.name, ':', t.slug) 
					ORDER BY t.id 
					SEPARATOR '|'
				) as tags
			FROM images i
			LEFT JOIN images_tags it ON i.id = it.image_id
			LEFT JOIN tags t ON it.tag_id = t.id
			WHERE i.is_in_gallery = TRUE
			GROUP BY i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.created_at, i.updated_at
			ORDER BY i.created_at DESC
		`;

		const [rows] = await pool.query<GalleryRow[]>(query);
		return parseImageRows(rows);
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images de la galerie :",
			err,
		);
		throw err;
	}
};

// Récupère une image par son ID, avec tous les champs.
// Utilisé pour afficher les détails d'une image individuelle.
// Retourne Image | null avec tous les champs (description, métadonnées, etc.).
const findById = async (id: number): Promise<Image | null> => {
	try {
		const [image] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images
      WHERE id = ?`,
			[id],
		);
		return image[0] || null;
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image par ID :", err);
		throw err;
	}
};

// Récupère toutes les images associées à un article par son ID.
// Utilisé pour afficher les images d'un article (version allégée pour l'affichage).
// Retourne un tableau de ImageForArticle (version allégée sans description complète) pour optimiser les performances.
const findByArticleId = async (id: number): Promise<ImageForArticle[]> => {
	try {
		const [images] = await pool.query<ImageForArticleRowFromQuery[]>(
			`SELECT id, title, path, alt_descr, article_id
      FROM images 
      WHERE article_id = ?`,
			[id],
		);
		return images;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID d'article :",
			err,
		);
		throw err;
	}
};

// Récupère toutes les images associées à un tag par son ID.
// Utilisé pour filtrer les images par tag (via la table de liaison images_tags).
// Retourne un tableau de Image avec tous les champs.
// Utilise un INNER JOIN entre images et images_tags pour récupérer les images liées au tag.
const findByTagId = async (id: number): Promise<Image[]> => {
	try {
		const [images] = await pool.query<ImageRow[]>(
			`SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.created_at, i.updated_at
      FROM images i
      INNER JOIN images_tags it ON i.id = it.image_id
      WHERE it.tag_id = ?`,
			[id],
		);
		return images;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des images par ID de tag :",
			err,
		);
		throw err;
	}
};

/**
 * Récupère l'image du jour depuis la galerie
 * Utilise le jour de l'année pour sélectionner une image de manière déterministe
 * L'image change automatiquement à minuit
 *
 * @returns Promise<Image | null> - L'image du jour ou null si aucune image en galerie
 */
const findImageOfTheDay = async (): Promise<Image | null> => {
	try {
		// 1. Récupérer toutes les images de la galerie, triées par ID (ordre stable)
		const query = `
      SELECT id, title, description, path, alt_descr, is_in_gallery,
             user_id, article_id, created_at, updated_at
      FROM images
      WHERE is_in_gallery = TRUE
      ORDER BY id ASC
    `;

		const [images] = await pool.query<ImageRow[]>(query);

		if (images.length === 0) {
			return null;
		}

		// 2. Calculer le jour de l'année (0-364/365)
		const today = new Date();
		const startOfYear = new Date(today.getFullYear(), 0, 1); // 1er janvier
		const dayOfYear = Math.floor(
			(today.getTime() - startOfYear.getTime()) / 86400000,
		); // 86400000 ms = 1 jour

		// 3. Sélectionner l'image basée sur le jour de l'année
		// Utilise le modulo pour cycler à travers les images
		const imageIndex = dayOfYear % images.length;

		return images[imageIndex];
	} catch (err) {
		console.error("Erreur lors de la récupération de l'image du jour :", err);
		throw err;
	}
};

export default {
	findAll,
	findGallery,
	findById,
	findByArticleId,
	findByTagId,
	findImageOfTheDay,
};
