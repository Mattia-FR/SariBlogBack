const adminIllustrationsModel = require("../model/adminIllustrationsModel");

// ✅ Lister toutes les illustrations (admin)
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [illustrations, totalCount] = await Promise.all([
			adminIllustrationsModel.findAll(limit, offset),
			adminIllustrationsModel.countAll(),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.success({
			illustrations,
			pagination: {
				limit,
				offset,
				totalCount,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Erreur browse admin illustrations:", error);
		res.error("Erreur lors de la récupération des illustrations", 500);
	}
};

// ✅ Récupérer une illustration par ID (admin)
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const illustration = await adminIllustrationsModel.findById(id);

		if (!illustration) {
			return res.error("Illustration non trouvée", 404);
		}

		res.success({ illustration });
	} catch (error) {
		console.error("Erreur read admin illustration:", error);
		res.error("Erreur lors de la récupération de l'illustration", 500);
	}
};

// ✅ Créer une nouvelle illustration
const create = async (req, res) => {
	try {
		const { title, description, image, alt_text, is_in_gallery, tagIds } = req.body;

		const newIllustration = await adminIllustrationsModel.create({
			title,
			description,
			image,
			alt_text,
			is_in_gallery,
			tagIds: tagIds || []
		});

		res.success({ illustration: newIllustration }, "Illustration créée avec succès");
	} catch (error) {
		console.error("Erreur create illustration:", error);
		res.error("Erreur lors de la création de l'illustration", 500);
	}
};

// ✅ Modifier une illustration
const update = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, image, alt_text, is_in_gallery, tagIds } = req.body;

		const updatedIllustration = await adminIllustrationsModel.update(id, {
			title,
			description,
			image,
			alt_text,
			is_in_gallery,
			tagIds: tagIds || []
		});

		res.success({ illustration: updatedIllustration }, "Illustration modifiée avec succès");
	} catch (error) {
		console.error("Erreur update illustration:", error);
		
		if (error.message === "Illustration non trouvée") {
			return res.error("Illustration non trouvée", 404);
		}
		
		res.error("Erreur lors de la modification de l'illustration", 500);
	}
};

// ✅ Supprimer une illustration
const remove = async (req, res) => {
	try {
		const { id } = req.params;
		
		const deletedIllustration = await adminIllustrationsModel.remove(id);

		res.success({ illustration: deletedIllustration }, "Illustration supprimée avec succès");
	} catch (error) {
		console.error("Erreur delete illustration:", error);
		
		if (error.message === "Illustration non trouvée") {
			return res.error("Illustration non trouvée", 404);
		}
		
		res.error("Erreur lors de la suppression de l'illustration", 500);
	}
};

// ✅ Récupérer tous les tags disponibles
const getTags = async (req, res) => {
	try {
		const tags = await adminIllustrationsModel.getAllTags();
		res.success({ tags });
	} catch (error) {
		console.error("Erreur get tags:", error);
		res.error("Erreur lors de la récupération des tags", 500);
	}
};

module.exports = {
	browse,
	read,
	create,
	update,
	remove,
	getTags
};