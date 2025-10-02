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
const { adminRateLimit } = require("../middleware/security");

// ✅ Appliquer le rate limit admin à toutes les routes admin
router.use(adminRateLimit);

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Lister tous les articles (admin)
router.get("/", validatePagination, browse);

// ✅ Lire un article spécifique (admin)
router.get("/:id", validateId, read);

// ✅ Créer un nouvel article
router.post("/", validateArticle, create);

// ✅ Mettre à jour un article
router.put("/:id", validateId, validateArticle, update);

// ✅ Supprimer un article
router.delete("/:id", validateId, remove);

// ✅ Obtenir tous les tags disponibles
router.get("/tags", getTags);

// ✅ Obtenir les tags d'un article
router.get("/:id/tags", validateId, getTags);

module.exports = router;
