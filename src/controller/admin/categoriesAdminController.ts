import type { Request, Response } from "express";
import categoriesAdminModel from "../../model/admin/categoriesAdminModel";
import type {
	Category,
	CategoryCreateData,
	CategoryUpdateData,
} from "../../types/categories";
import { HttpError } from "../../utils/httpErrors";
import { parseIdParam } from "../../utils/requestParams";
import { buildSlug } from "../../utils/slug";

// Récupère une catégorie par ID.
// GET /admin/categories/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const categoryId = parseIdParam(req.params.id);
	const category: Category | null =
		await categoriesAdminModel.findById(categoryId);
	if (!category) {
		throw new HttpError(404, "Catégorie non trouvée");
	}
	res.status(200).json(category);
};

// Crée une catégorie. Body : name (requis), slug (optionnel), display_order (optionnel, défaut : dernière position).
// POST /admin/categories
const add = async (req: Request, res: Response): Promise<void> => {
	const { name, slug: slugProvided, display_order } = req.body;
	const slug = buildSlug(slugProvided || name);
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}

	const data: CategoryCreateData = { name, slug, display_order };
	const newCategory: Category = await categoriesAdminModel.create(data);
	res.status(201).json(newCategory);
};

// Met à jour une catégorie. Body : name, slug et/ou display_order (optionnels, mise à jour partielle).
// PATCH /admin/categories/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	const categoryId = parseIdParam(req.params.id);

	const data: CategoryUpdateData = {};
	const { name, slug, display_order } = req.body;
	if (name !== undefined && name !== "") {
		data.name = name;
	}
	if (slug !== undefined && slug !== "") {
		const sanitized = buildSlug(slug);
		if (!sanitized) {
			throw new HttpError(400, "Slug invalide");
		}
		data.slug = sanitized;
	}
	if (display_order !== undefined) {
		data.display_order = display_order;
	}

	const updatedCategory: Category | null = await categoriesAdminModel.update(
		categoryId,
		data,
	);
	if (!updatedCategory) {
		throw new HttpError(404, "Catégorie non trouvée");
	}
	res.status(200).json(updatedCategory);
};

// Supprime une catégorie par ID.
// DELETE /admin/categories/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const categoryId = parseIdParam(req.params.id);
	const deleted: boolean = await categoriesAdminModel.deleteOne(categoryId);
	if (!deleted) {
		throw new HttpError(404, "Catégorie non trouvée");
	}
	res.sendStatus(204);
};

export { readById, add, edit, destroy };
