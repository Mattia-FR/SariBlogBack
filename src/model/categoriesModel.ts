import type { Category } from "../types/categories";
import pool from "./db";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Category.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findAll = async (): Promise<Category[]> => {
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [rows]: any = await pool.query(
		"SELECT id, name, slug, display_order, created_at FROM categories ORDER BY display_order",
	);
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	return rows.map((row: any) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		display_order: row.display_order,
		created_at: row.created_at,
	}));
};

const findBySlug = async (slug: string): Promise<Category | null> => {
	// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
	const [rows]: any = await pool.query(
		"SELECT id, name, slug, display_order, created_at FROM categories WHERE slug = ?",
		[slug],
	);
	if (!rows[0]) return null;
	const row = rows[0];
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		display_order: row.display_order,
		created_at: row.created_at,
	};
};

export default { findAll, findBySlug };
