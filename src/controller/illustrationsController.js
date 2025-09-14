const illustrationsModel = require("../model/illustrationsModel");

// ✅ Homepage - 6 illustrations pour le carrousel - CORRIGÉ
const getGalleryPreview = async (req, res) => {
	try {
		const { limit } = req.query;
		const illustrations = await illustrationsModel.findGalleryPreview(limit);

		res.success({ illustrations });
	} catch (error) {
		console.error("Erreur getGalleryPreview:", error);
		res.error("Erreur lors de la récupération de l'aperçu galerie", 500);
	}
};

// ✅ Page galerie - toutes les illustrations avec pagination - CORRIGÉ
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [illustrations, totalCount] = await Promise.all([
			illustrationsModel.findAllInGallery(limit, offset),
			illustrationsModel.countInGallery(),
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
		console.error("Erreur browse illustrations:", error);
		res.error("Erreur lors de la récupération des illustrations", 500);
	}
};

// ✅ Illustration individuelle
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const illustration = await illustrationsModel.findById(id);

		if (!illustration) {
			return res.error("Illustration non trouvée", 404);
		}

		res.success({ illustration });
	} catch (error) {
		console.error("Erreur read illustration:", error);
		res.error("Erreur lors de la récupération de l'illustration", 500);
	}
};

module.exports = {
	getGalleryPreview,
	browse,
	read,
};
