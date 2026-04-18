import type { Request, Response } from "express";
import categoriesModel from "../model/categoriesModel";
import type { Category } from "../types/categories";
import { sendError } from "../utils/httpErrors";
import logger from "../utils/logger";

// Liste toutes les catégories (ordre d'affichage).
// GET /categories
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const categories: Category[] = await categoriesModel.findAll();
		res.status(200).json(categories);
	} catch (err) {
		logger.error("Erreur lors de la récupération des catégories :", err);
		sendError(res, 500, "Erreur lors de la récupération des catégories");
	}
};

// Récupère une catégorie par son slug.
// GET /categories/:slug
const getBySlug = async (req: Request, res: Response): Promise<void> => {
	try {
		const slug: string = req.params.slug;
		if (!slug) {
			sendError(res, 400, "Slug invalide");
			return;
		}
		const category: Category | null = await categoriesModel.findBySlug(slug);
		if (!category) {
			sendError(res, 404, "Catégorie non trouvée");
			return;
		}
		res.status(200).json(category);
	} catch (err) {
		logger.error(
			"Erreur lors de la récupération de la catégorie par slug :",
			err,
		);
		sendError(
			res,
			500,
			"Erreur lors de la récupération de la catégorie par slug",
		);
	}
};

export { browseAll, getBySlug };
