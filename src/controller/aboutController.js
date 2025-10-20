const aboutModel = require("../model/aboutModel");

const getAbout = async (req, res) => {
	try {
		const about = await aboutModel.findAbout();

		if (!about) {
			return res.error("Contenu 'À propos' non trouvé", 404);
		}

		res.success({ about });
	} catch (error) {
		console.error("Erreur getAbout:", error);
		res.error("Erreur lors de la récupération du contenu 'À propos'", 500);
	}
};

module.exports = {
	getAbout,
};
