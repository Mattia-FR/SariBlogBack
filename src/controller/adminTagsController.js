const adminTagsModel = require("../model/adminTagsModel");

// ✅ Lister tous les tags (admin)
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [tags, totalCount] = await Promise.all([
			adminTagsModel.findAll(limit, offset),
			adminTagsModel.countAll(),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.success({
			tags,
			pagination: {
				limit,
				offset,
				totalCount,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Erreur browse admin tags:", error);
		res.error("Erreur lors de la récupération des tags", 500);
	}
};

// ✅ Récupérer un tag par ID (admin)
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const tag = await adminTagsModel.findById(id);

		if (!tag) {
			return res.error("Tag non trouvé", 404);
		}

		res.success({ tag });
	} catch (error) {
		console.error("Erreur read admin tag:", error);
		res.error("Erreur lors de la récupération du tag", 500);
	}
};

// ✅ Créer un nouveau tag
const create = async (req, res) => {
	try {
		const { name } = req.body;

		const newTag = await adminTagsModel.create({ name });

		res.success({ tag: newTag }, "Tag créé avec succès");
	} catch (error) {
		console.error("Erreur create tag:", error);
		
		if (error.message === "Un tag avec ce nom existe déjà") {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_TAG",
					message: error.message,
				},
			});
		}
		
		res.error("Erreur lors de la création du tag", 500);
	}
};

// ✅ Modifier un tag
const update = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;

		const updatedTag = await adminTagsModel.update(id, { name });

		res.success({ tag: updatedTag }, "Tag modifié avec succès");
	} catch (error) {
		console.error("Erreur update tag:", error);
		
		if (error.message === "Tag non trouvé") {
			return res.error("Tag non trouvé", 404);
		}
		
		if (error.message === "Un tag avec ce nom existe déjà") {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_TAG",
					message: error.message,
				},
			});
		}
		
		res.error("Erreur lors de la modification du tag", 500);
	}
};

// ✅ Supprimer un tag
const remove = async (req, res) => {
	try {
		const { id } = req.params;
		
		const deletedTag = await adminTagsModel.remove(id);

		res.success({ tag: deletedTag }, "Tag supprimé avec succès");
	} catch (error) {
		console.error("Erreur delete tag:", error);
		
		if (error.message === "Tag non trouvé") {
			return res.error("Tag non trouvé", 404);
		}
		
		if (error.message === "Impossible de supprimer ce tag car il est utilisé par des articles ou illustrations") {
			return res.status(409).json({
				success: false,
				error: {
					code: "TAG_IN_USE",
					message: error.message,
				},
			});
		}
		
		res.error("Erreur lors de la suppression du tag", 500);
	}
};

// ✅ Obtenir les statistiques des tags
const getStats = async (req, res) => {
	try {
		const stats = await adminTagsModel.getStats();
		res.success({ stats });
	} catch (error) {
		console.error("Erreur get stats tags:", error);
		res.error("Erreur lors de la récupération des statistiques", 500);
	}
};

// ✅ Rechercher des tags
const search = async (req, res) => {
	try {
		const { q, limit } = req.query;
		
		if (!q || q.trim().length < 2) {
			return res.status(400).json({
				success: false,
				error: {
					code: "INVALID_SEARCH",
					message: "Le terme de recherche doit contenir au moins 2 caractères",
				},
			});
		}

		const tags = await adminTagsModel.search(q.trim(), limit || 10);
		res.success({ tags, searchTerm: q.trim() });
	} catch (error) {
		console.error("Erreur search tags:", error);
		res.error("Erreur lors de la recherche des tags", 500);
	}
};

module.exports = {
	browse,
	read,
	create,
	update,
	remove,
	getStats,
	search
};