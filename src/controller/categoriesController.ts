import type { Request, Response } from "express";
import categoriesModel from "../model/categoriesModel";
import type { Category } from "../types/categories";

// Liste toutes les catégories (ordre d'affichage).
// GET /categories
const browseAll = async (req: Request, res: Response): Promise<void> => {
	try {
		const categories: Category[] = await categoriesModel.findAll();
		res.status(200).json(categories);
	} catch (err) {
		console.error("Erreur lors de la récupération des catégories :", err);
		res
			.status(500)
			.json({ error: "Erreur lors de la récupération des catégories" });
	}
};

export { browseAll };
