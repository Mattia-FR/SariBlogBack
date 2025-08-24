const articlesModel = require("../model/articlesModel");

const getLatestPublished = async (req, res) => {
	try {
		const limit = req.query.limit
			? Number.parseInt(req.query.limit)
			: undefined;

		const articles = await articlesModel.findLatestPublished(limit);

		// 🔍 Debug : Vérifier les données avant envoi
		console.log("=== DEBUG ENCODING ===");
		console.log("Premier titre:", articles[0]?.title);
		console.log("Premier excerpt:", articles[0]?.excerpt);
		console.log("Buffer du titre:", Buffer.from(articles[0]?.title || ""));
		console.log("=====================");

		res.json({
			success: true,
			data: articles,
			count: articles.length,
		});
	} catch (error) {
		console.error("Erreur getLatestPublished:", error);
		res.status(500).json({
			success: false,
			error: "Erreur lors de la récupération des articles",
		});
	}
};

module.exports = {
	getLatestPublished,
};
