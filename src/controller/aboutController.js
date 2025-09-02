const aboutModel = require("../model/aboutModel");

const getAboutPreview = async (req, res) => {
	try {
		const about = await aboutModel.findAbout();
		res.json(about);
	} catch (error) {
		console.error("Erreur getAbout:", error);
		res.status(500).json({
			error: "Erreur lors de la récupération des informations",
		});
	}
};

module.exports = { getAboutPreview };
