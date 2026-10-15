import type { Request, Response } from "express";
import tagsAdminModel from "../../model/admin/tagsAdminModel";
import type { Tag } from "../../types/tags";
import { HttpError } from "../../utils/httpErrors";
import { parseIdParam } from "../../utils/requestParams";
import { buildSlug } from "../../utils/slug";

// Liste tous les tags (y compris non utilisés).
// GET /admin/tags
const browseAll = async (_req: Request, res: Response): Promise<void> => {
	const tags: Tag[] = await tagsAdminModel.findAll();
	res.status(200).json(tags);
};

// Tags utilisés sur au moins un article (tous statuts), filtre liste articles admin.
// GET /admin/tags/used-on-articles
const browseUsedOnArticles = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const tags: Tag[] = await tagsAdminModel.findUsedOnArticles();
	res.status(200).json(tags);
};

// Tags utilisés sur au moins une image (filtre liste images admin).
// GET /admin/tags/used-on-images
const browseUsedOnImages = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	const tags: Tag[] = await tagsAdminModel.findUsedOnImages();
	res.status(200).json(tags);
};

// Récupère un tag par ID.
// GET /admin/tags/:id
const readById = async (req: Request, res: Response): Promise<void> => {
	const tagId = parseIdParam(req.params.id);
	const tag: Tag | null = await tagsAdminModel.findById(tagId);
	if (!tag) {
		throw new HttpError(404, "Tag non trouvé");
	}
	res.status(200).json(tag);
};

// Crée un tag. Body : name (requis), slug (optionnel, déduit du name si absent).
// POST /admin/tags
const add = async (req: Request, res: Response): Promise<void> => {
	const { name, slug: slugProvided } = req.body;
	const slug = buildSlug(slugProvided || name);
	if (!slug) {
		throw new HttpError(400, "Slug invalide");
	}

	const newTag: Tag = await tagsAdminModel.create({ name, slug });
	res.status(201).json(newTag);
};

// Met à jour un tag. Body : name et/ou slug (optionnels, mise à jour partielle).
// PATCH /admin/tags/:id
const edit = async (req: Request, res: Response): Promise<void> => {
	const tagId = parseIdParam(req.params.id);

	const data: { name?: string; slug?: string } = {};
	const { name, slug } = req.body;
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

	const updatedTag: Tag | null = await tagsAdminModel.update(tagId, data);
	if (!updatedTag) {
		throw new HttpError(404, "Tag non trouvé");
	}
	res.status(200).json(updatedTag);
};

// Supprime un tag par ID.
// DELETE /admin/tags/:id
const destroy = async (req: Request, res: Response): Promise<void> => {
	const tagId = parseIdParam(req.params.id);
	const deleted: boolean = await tagsAdminModel.deleteOne(tagId);
	if (!deleted) {
		throw new HttpError(404, "Tag non trouvé");
	}
	res.sendStatus(204);
};

export {
	browseAll,
	browseUsedOnArticles,
	browseUsedOnImages,
	readById,
	add,
	edit,
	destroy,
};
