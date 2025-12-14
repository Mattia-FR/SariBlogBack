import pool from "./db";
// ImageRow est un type qui représente une ligne de résultat d'une requête SELECT.
// Image contient tous les champs d'une image (description complète, métadonnées).
// ImageForArticle est une version allégée pour l'affichage dans les articles (sans description complète).
import type { ImageRow, Image, ImageForArticle } from "../types/images";

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

// Récupère toutes les images de la galerie (is_in_gallery = TRUE).
// Utilisé pour afficher la galerie publique d'images.
// Retourne un tableau de Image contenant uniquement les images marquées comme étant dans la galerie.
const findGallery = async (): Promise<Image[]> => {
	try {
		const [images] = await pool.query<ImageRow[]>(
			`SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, created_at, updated_at
      FROM images
      WHERE is_in_gallery = TRUE`,
		);
		return images;
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
		const [images] = await pool.query<ImageRow[]>(
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

export default { findAll, findGallery, findById, findByArticleId, findByTagId };
