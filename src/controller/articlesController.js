const articlesModel = require("../model/articlesModel");

const getLatestPublished = async (req, res) => {
	try {
		const limit = req.query.limit
			? Number.parseInt(req.query.limit)
			: undefined;

		const articles = await articlesModel.findLatestPublished(limit);

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
