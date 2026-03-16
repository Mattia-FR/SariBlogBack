import pool from "../db";
import type {
	Category,
	CategoryCreateData,
	CategoryUpdateData,
} from "../../types/categories";
import type { ResultSetHeader, PoolConnection } from "mysql2/promise";

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
	const connection: PoolConnection = await pool.getConnection();
	try {
		await connection.beginTransaction();

		let display_order: number;

		if (data.display_order === undefined) {
			// Aucune position fournie : on place la catégorie en dernier
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			const [rows]: any = await connection.query(
				"SELECT COALESCE(MAX(display_order), -1) AS max_order FROM categories",
			);
			display_order = rows[0].max_order + 1;
		} else {
			// Position fournie : on décale toutes les catégories à partir de cette position
			display_order = data.display_order;
			await connection.query(
				`UPDATE categories
				SET display_order = display_order + 1
				WHERE display_order >= ?`,
				[display_order],
			);
		}

		const [result] = await connection.query<ResultSetHeader>(
			"INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)",
			[data.name, data.slug, display_order],
		);

		await connection.commit();

		return {
			id: result.insertId,
			name: data.name,
			slug: data.slug,
			display_order,
			created_at: new Date().toISOString(),
		};
	} catch (err) {
		await connection.rollback();
		console.error(err);
		throw err;
	} finally {
		connection.release();
	}
};

const update = async (
	id: number,
	data: CategoryUpdateData,
): Promise<Category | null> => {
	const connection: PoolConnection = await pool.getConnection();
	try {
		await connection.beginTransaction();

		// Si on change la position, on décale d'abord les catégories impactées
		if (data.display_order !== undefined) {
			// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
			const [rows]: any = await connection.query(
				"SELECT display_order FROM categories WHERE id = ?",
				[id],
			);
			const currentOrder: number = rows[0]?.display_order;
			const newOrder: number = data.display_order;

			if (currentOrder !== undefined && currentOrder !== newOrder) {
				if (newOrder > currentOrder) {
					// La catégorie descend : on remonte celles qui sont entre les deux positions
					await connection.query(
						`UPDATE categories
						SET display_order = display_order - 1
						WHERE id != ? AND display_order > ? AND display_order <= ?`,
						[id, currentOrder, newOrder],
					);
				} else {
					// La catégorie monte : on descend celles qui sont entre les deux positions
					await connection.query(
						`UPDATE categories
						SET display_order = display_order + 1
						WHERE id != ? AND display_order >= ? AND display_order < ?`,
						[id, newOrder, currentOrder],
					);
				}
			}
		}

		// Mise à jour des champs de la catégorie cible
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

		const [result] = await connection.query<ResultSetHeader>(
			`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
			values,
		);

		await connection.commit();

		if (result.affectedRows === 0) return null;
		return await findById(id);
	} catch (err) {
		await connection.rollback();
		console.error(err);
		throw err;
	} finally {
		connection.release();
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
