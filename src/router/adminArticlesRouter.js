const express = require("express");
const router = express.Router();

const {
	browse,
	read,
	create,
	update,
	remove,
	getTags,
} = require("../controller/adminArticlesController");
const { authenticateToken } = require("../middleware/auth");
const {
	validatePagination,
	validateId,
	validateArticle,
} = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Lister tous les articles (admin)
router.get("/", validatePagination, browse);

// ✅ Récupérer tous les tags disponibles
router.get("/tags", getTags);

// ✅ Récupérer un article par ID (admin)
router.get("/:id", validateId, read);

// ✅ Créer un nouvel article
router.post("/", validateArticle, create);

// ✅ Modifier un article
router.put("/:id", validateId, validateArticle, update);

// ✅ Supprimer un article
router.delete("/:id", validateId, remove);

module.exports = router;
