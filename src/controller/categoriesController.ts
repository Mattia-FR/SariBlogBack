import type { Request, Response } from "express";
import categoriesModel from "../model/categoriesModel";
import type { Category } from "../types/categories";
import { HttpError } from "../utils/httpErrors";

// Liste toutes les catégories (ordre d'affichage).
// GET /categories
const browseAll = async (_req: Request, res: Response): Promise<void> => {
	const categories: Category[] = await categoriesModel.findAll();
	res.status(200).json(categories);
};

// Récupère une catégorie par son slug.
// GET /categories/:slug
const getBySlug = async (req: Request, res: Response): Promise<void> => {
	const slug: string = req.params.slug;
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}
	const category: Category | null = await categoriesModel.findBySlug(slug);
	if (!category) {
		throw new HttpError(404, "Catégorie non trouvée");
	}
	res.status(200).json(category);
};

export { browseAll, getBySlug };
