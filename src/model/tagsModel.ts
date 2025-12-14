import pool from "./db";
// TagRow est un type qui représente une ligne de résultat d'une requête SELECT.
// Tag contient tous les champs d'un tag (id, name, slug, created_at).
import type { TagRow, Tag } from "../types/tags";

// Récupère tous les tags de la base de données.
// Utilisé pour les listes complètes de tags (admin ou affichage public).
// Retourne un tableau de Tag avec tous les champs.
const findAll = async (): Promise<Tag[]> => {
	try {
		const [tags] = await pool.query<TagRow[]>(
			"SELECT id, name, slug, created_at FROM tags",
		);
		return tags;
	} catch (err) {
		console.error("Erreur lors de la récupération de tous les tags :", err);
		throw err;
	}
};

// Récupère tous les tags associés à un article par son ID.
// Utilisé pour afficher les tags d'un article (via la table de liaison articles_tags).
// Retourne un tableau de Tag avec tous les champs.
// Utilise un INNER JOIN entre tags et articles_tags pour récupérer les tags liés à l'article.
const findByArticleId = async (id: number): Promise<Tag[]> => {
	try {
		const [tags] = await pool.query<TagRow[]>(
			`SELECT t.id, t.name, t.slug, t.created_at
      FROM tags t
      INNER JOIN articles_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?`,
			[id],
		);
		return tags;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'article :",
			err,
		);
		throw err;
	}
};

// Récupère tous les tags associés à une image par son ID.
// Utilisé pour afficher les tags d'une image (via la table de liaison images_tags).
// Retourne un tableau de Tag avec tous les champs.
// Utilise un INNER JOIN entre tags et images_tags pour récupérer les tags liés à l'image.
const findByImageId = async (id: number): Promise<Tag[]> => {
	try {
		const [tags] = await pool.query<TagRow[]>(
			`SELECT t.id, t.name, t.slug, t.created_at
      FROM tags t
      INNER JOIN images_tags it ON t.id = it.tag_id
      WHERE it.image_id = ?`,
			[id],
		);
		return tags;
	} catch (err) {
		console.error(
			"Erreur lors de la récupération des tags par ID d'image :",
			err,
		);
		throw err;
	}
};

export default {
	findAll,
	findByArticleId,
	findByImageId,
};
