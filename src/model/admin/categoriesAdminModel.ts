import type { ResultSetHeader } from "mysql2/promise";
import type {
	Category,
	CategoryCreateData,
	CategoryUpdateData,
} from "../../types/categories";
import { HttpError } from "../../utils/httpErrors";
import { isDuplicateEntry } from "../../utils/mysqlErrors";
import pool, { withTransaction } from "../db";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Category.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

function rethrowDuplicate(err: unknown): never {
	if (isDuplicateEntry(err)) {
		throw new HttpError(
			409,
			"Une catégorie avec ce nom ou ce slug existe déjà",
			"CATEGORY_TAKEN",
		);
	}
	throw err;
}

const findById = async (id: number): Promise<Category | null> => {
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
};

const create = async (data: CategoryCreateData): Promise<Category> => {
	try {
		return await withTransaction(async (connection) => {
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

			return {
				id: result.insertId,
				name: data.name,
				slug: data.slug,
				display_order,
				created_at: new Date().toISOString(),
			};
		});
	} catch (err) {
		rethrowDuplicate(err);
	}
};

const update = async (
	id: number,
	data: CategoryUpdateData,
): Promise<Category | null> => {
	let affectedRows: number;
	try {
		affectedRows = await withTransaction(async (connection) => {
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

			values.push(id);

			const [result] = await connection.query<ResultSetHeader>(
				`UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
				values,
			);
			return result.affectedRows;
		});
	} catch (err) {
		rethrowDuplicate(err);
	}

	if (affectedRows === 0) return null;
	return findById(id);
};

const deleteOne = async (id: number): Promise<boolean> => {
	const [result] = await pool.query<ResultSetHeader>(
		"DELETE FROM categories WHERE id = ?",
		[id],
	);
	return result.affectedRows > 0;
};

export default { findById, create, update, deleteOne };
