const adminArticlesModel = require("../model/adminArticlesModel");

// ✅ Lister tous les articles (admin)
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [articles, totalCount] = await Promise.all([
			adminArticlesModel.findAll(limit, offset),
			adminArticlesModel.countAll(),
		]);

		const limitNum = Number(limit) || 10;
		const totalPages = Math.ceil(totalCount / limitNum);

		res.success({
			articles,
			pagination: {
				limit: limitNum,
				offset: Number(offset) || 0,
				totalCount,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Erreur browse admin articles:", error);
		res.error("Erreur lors de la récupération des articles", 500);
	}
};

// ✅ Récupérer un article par ID (admin)
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const article = await adminArticlesModel.findById(id);

		if (!article) {
			return res.error("Article non trouvé", 404);
		}

		res.success({ article });
	} catch (error) {
		console.error("Erreur read admin article:", error);
		res.error("Erreur lors de la récupération de l'article", 500);
	}
};

// ✅ Créer un nouvel article
const create = async (req, res) => {
	try {
		const { title, excerpt, content, image, status, tagIds } = req.body;

		const newArticle = await adminArticlesModel.create({
			title,
			excerpt,
			content,
			image,
			status,
			tagIds: tagIds || []
		});

		res.success({ article: newArticle }, "Article créé avec succès");
	} catch (error) {
		console.error("Erreur create article:", error);
		
		if (error.message === "Un article avec ce titre existe déjà") {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_TITLE",
					message: error.message,
				},
			});
		}
		
		res.error("Erreur lors de la création de l'article", 500);
	}
};

// ✅ Modifier un article
const update = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, excerpt, content, image, status, tagIds } = req.body;

		const updatedArticle = await adminArticlesModel.update(id, {
			title,
			excerpt,
			content,
			image,
			status,
			tagIds: tagIds || []
		});

		res.success({ article: updatedArticle }, "Article modifié avec succès");
	} catch (error) {
		console.error("Erreur update article:", error);
		
		if (error.message === "Article non trouvé") {
			return res.error("Article non trouvé", 404);
		}
		
		if (error.message === "Un article avec ce titre existe déjà") {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_TITLE",
					message: error.message,
				},
			});
		}
		
		res.error("Erreur lors de la modification de l'article", 500);
	}
};

// ✅ Supprimer un article
const remove = async (req, res) => {
	try {
		const { id } = req.params;
		
		const deletedArticle = await adminArticlesModel.remove(id);

		res.success({ article: deletedArticle }, "Article supprimé avec succès");
	} catch (error) {
		console.error("Erreur delete article:", error);
		
		if (error.message === "Article non trouvé") {
			return res.error("Article non trouvé", 404);
		}
		
		res.error("Erreur lors de la suppression de l'article", 500);
	}
};

// ✅ Récupérer tous les tags disponibles
const getTags = async (req, res) => {
	try {
		const tags = await adminArticlesModel.getAllTags();
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