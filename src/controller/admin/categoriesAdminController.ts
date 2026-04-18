import type { Request, Response } from "express";
import categoriesAdminModel from "../../model/admin/categoriesAdminModel";
import type {
	Category,
	CategoryCreateData,
	CategoryUpdateData,
} from "../../types/categories";
import { sendError } from "../../utils/httpErrors";
import logger from "../../utils/logger";
import { buildSlug } from "../../utils/slug";

// Récupère une catégorie par ID.
// GET /admin/categories/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	try {
		const categoryId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(categoryId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const category: Category | null =
			await categoriesAdminModel.findById(categoryId);
		if (!category) {
			sendError(res, 404, "Catégorie non trouvée");
			return;
		}
		res.status(200).json(category);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de la catégorie par ID (admin) :",
			err,
		);
		sendError(res, 500, "Erreur lors de la récupération de la catégorie");
	}
};

// Crée une catégorie. Body : name (requis), slug (optionnel), display_order (optionnel, défaut : dernière position).
// POST /admin/categories
const add = async (req: Request, res: Response): Promise<void> => {
	try {
		const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
		if (!name) {
			sendError(res, 400, "Le nom est requis");
			return;
		}
		const slugProvided =
			req.body.slug && typeof req.body.slug === "string"
				? req.body.slug.trim()
				: "";
		let slug: string;
		if (slugProvided) {
			slug = buildSlug(slugProvided);
			if (!slug) {
				sendError(res, 400, "Slug invalide");
				return;
			}
		} else {
			slug = buildSlug(name);
		}

		// Si display_order n'est pas fourni ou invalide, on passe undefined :
		// le model se chargera de placer la catégorie en dernière position.
		const display_order =
			typeof req.body.display_order === "number" &&
			Number.isInteger(req.body.display_order)
				? req.body.display_order
				: undefined;

		const data: CategoryCreateData = { name, slug, display_order };
		const newCategory: Category = await categoriesAdminModel.create(data);
		res.status(201).json(newCategory);
	} catch (err) {
		logger.error("Erreur lors de la création de la catégorie (admin) :", err);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Une catégorie avec ce nom ou ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la création de la catégorie");
	}
};

// Met à jour une catégorie. Body : name, slug et/ou display_order (optionnels, mise à jour partielle).
// PATCH /admin/categories/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	try {
		const categoryId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(categoryId)) {
			sendError(res, 400, "ID invalide");
			return;
		}

		const data: CategoryUpdateData = {};
		const { name, slug, display_order } = req.body;
		if (name !== undefined) {
			const trimmed = typeof name === "string" ? name.trim() : "";
			if (trimmed) data.name = trimmed;
		}
		if (slug !== undefined) {
			const trimmed = typeof slug === "string" ? slug.trim() : "";
			if (trimmed) {
				const sanitized = buildSlug(trimmed);
				if (!sanitized) {
					sendError(res, 400, "Slug invalide");
					return;
				}
				data.slug = sanitized;
			}
		}
		if (display_order !== undefined) {
			if (
				typeof display_order === "number" &&
				Number.isInteger(display_order)
			) {
				data.display_order = display_order;
			}
		}

		if (Object.keys(data).length === 0) {
			sendError(
				res,
				400,
				"Au moins un champ (name, slug ou display_order) doit être fourni et valide",
			);
			return;
		}

		const updatedCategory: Category | null = await categoriesAdminModel.update(
			categoryId,
			data,
		);
		if (!updatedCategory) {
			sendError(res, 404, "Catégorie non trouvée");
			return;
		}
		res.status(200).json(updatedCategory);
	} catch (err) {
		logger.error(
			"Erreur lors de la mise à jour de la catégorie (admin) :",
			err,
		);

		if (err instanceof Error && err.message.includes("Duplicate entry")) {
			sendError(res, 409, "Une catégorie avec ce nom ou ce slug existe déjà");
			return;
		}

		sendError(res, 500, "Erreur lors de la mise à jour de la catégorie");
	}
};

// Supprime une catégorie par ID.
// DELETE /admin/categories/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	try {
		const categoryId: number = Number.parseInt(req.params.id, 10);
		if (Number.isNaN(categoryId)) {
			sendError(res, 400, "ID invalide");
			return;
		}
		const deleted: boolean = await categoriesAdminModel.deleteOne(categoryId);
		if (!deleted) {
			sendError(res, 404, "Catégorie non trouvée");
			return;
		}
		res.sendStatus(204);
	} catch (err) {
		logger.error(
			"Erreur lors de la suppression de la catégorie (admin) :",
			err,
		);
		sendError(res, 500, "Erreur lors de la suppression de la catégorie");
	}
};

export { readById, add, edit, destroy };
