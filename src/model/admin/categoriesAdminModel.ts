import pool from "../db";
import type {
	Category,
	CategoryCreateData,
	CategoryUpdateData,
} from "../../types/categories";
import type { ResultSetHeader } from "mysql2/promise";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Category.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findById = async (id: number): Promise<Category | null> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			"SELECT * FROM categories WHERE id = ?",
			[id],
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
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const create = async (data: CategoryCreateData): Promise<Category> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)",
			[data.name, data.slug, data.display_order],
		);
		return {
			id: result.insertId,
			...data,
			created_at: new Date().toISOString(),
		};
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const update = async (
	id: number,
	data: CategoryUpdateData,
): Promise<Category | null> => {
	try {
		const updates: string[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const values: any[] = [];

		if (data.name !== undefined) {
			updates.push("name = ?");
			values.push(data.name);
		}
		if (data.slug !== undefined) {
			updates.push("slug = ?");
			values.push(data.slug);
		}
		if (data.display_order !== undefined) {
			updates.push("display_order = ?");
			values.push(data.display_order);
		}

		if (updates.length === 0) {
			throw new Error("Aucun champ à mettre à jour");
		}

		values.push(id);

		const [result] = await pool.query<ResultSetHeader>(
			`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
			values,
		);

		if (result.affectedRows === 0) return null;
		return await findById(id);
	} catch (err) {
		console.error(err);
		throw err;
	}
};

const deleteOne = async (id: number): Promise<boolean> => {
	try {
		const [result] = await pool.query<ResultSetHeader>(
			"DELETE FROM categories WHERE id = ?",
			[id],
		);
		return result.affectedRows > 0;
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default { findById, create, update, deleteOne };
