const articlesModel = require("../model/articlesModel");

// ✅ Homepage - 4 derniers articles - CORRIGÉ
const getLatest = async (req, res) => {
	try {
		const { limit } = req.query;
		const articles = await articlesModel.findLatestPublished(limit);

		res.success({ articles });
	} catch (error) {
		console.error("Erreur getLatest:", error);
		res.error("Erreur lors de la récupération des derniers articles", 500);
	}
};

// ✅ Page blog - tous les articles avec pagination - CORRIGÉ
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [articles, totalCount] = await Promise.all([
			articlesModel.findAllPublished(limit, offset),
			articlesModel.countPublished(),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.success({
			articles,
			pagination: {
				limit,
				offset,
				totalCount,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Erreur browse articles:", error);
		res.error("Erreur lors de la récupération des articles", 500);
	}
};

// ✅ Article individuel par slug
const readBySlug = async (req, res) => {
	try {
		const { slug } = req.params;
		const article = await articlesModel.findBySlug(slug);

		if (!article) {
			return res.error("Article non trouvé", 404);
		}

		res.success({ article });
	} catch (error) {
		console.error("Erreur readBySlug:", error);
		res.error("Erreur lors de la récupération de l'article", 500);
	}
};

module.exports = {
	getLatest,
	browse,
	readBySlug,
};
