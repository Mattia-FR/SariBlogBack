const articlesModel = require("../model/articlesModel");

// READ - Lire tous les articles (avec pagination)
const browse = async (req, res) => {
	try {
		const limit = req.query.limit ? Number.parseInt(req.query.limit) : 10;
		const page = req.query.page ? Number.parseInt(req.query.page) : 1;
		const offset = (page - 1) * limit;

		const articles = await articlesModel.findAllPublished(limit, offset);

		res.json({
			articles,
			pagination: {
				page,
				limit,
				hasMore: articles.length === limit,
			},
		});
	} catch (error) {
		console.error("Erreur browse articles:", error);
		res.status(500).json({
			error: "Erreur lors de la récupération des articles",
		});
	}
};

// READ - Lire un article spécifique
const read = async (req, res) => {
	try {
		const { slug } = req.params;

		const article = await articlesModel.findBySlug(slug);

		if (!article) {
			return res.status(404).json({
				error: "Article non trouvé",
			});
		}

		res.json(article);
	} catch (error) {
		console.error("Erreur read article:", error);
		res.status(500).json({
			error: "Erreur lors de la récupération de l'article",
		});
	}
};

// READ - Fonction spéciale pour les derniers articles
const getLatest = async (req, res) => {
	try {
		const limit = req.query.limit
			? Number.parseInt(req.query.limit)
			: undefined;

		const articles = await articlesModel.findLatestPublished(limit);

		// Retourner directement le tableau
		res.json(articles);
	} catch (error) {
		console.error("Erreur getLatest:", error);
		res.status(500).json({
			error: "Erreur lors de la récupération des articles",
		});
	}
};

module.exports = {
	browse, // GET /api/articles
	read, // GET /api/articles/:slug
	getLatest, // GET /api/articles/latest
};
