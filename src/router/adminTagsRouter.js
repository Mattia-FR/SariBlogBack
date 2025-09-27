const express = require("express");
const router = express.Router();

const {
	browse,
	read,
	create,
	update,
	remove,
	getStats,
	search
} = require("../controller/adminTagsController");
const { authenticateToken } = require("../middleware/auth");
const { validatePagination, validateId, validateTag } = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Obtenir les statistiques des tags
router.get("/stats", getStats);

// ✅ Rechercher des tags
router.get("/search", search);

// ✅ Lister tous les tags (admin)
router.get("/", validatePagination, browse);

// ✅ Récupérer un tag par ID (admin)
router.get("/:id", validateId, read);

// ✅ Créer un nouveau tag
router.post("/", validateTag, create);

// ✅ Modifier un tag
router.put("/:id", validateId, validateTag, update);

// ✅ Supprimer un tag
router.delete("/:id", validateId, remove);

module.exports = router;