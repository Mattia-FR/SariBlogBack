const express = require("express");
const router = express.Router();

const {
	browse,
	read,
	create,
	update,
	remove,
	getTags
} = require("../controller/adminIllustrationsController");
const { authenticateToken } = require("../middleware/auth");
const { validatePagination, validateId, validateIllustration } = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Lister toutes les illustrations (admin)
router.get("/", validatePagination, browse);

// ✅ Récupérer tous les tags disponibles
router.get("/tags", getTags);

// ✅ Récupérer une illustration par ID (admin)
router.get("/:id", validateId, read);

// ✅ Créer une nouvelle illustration - AJOUT DE LA VALIDATION
router.post("/", validateIllustration, create);

// ✅ Modifier une illustration - AJOUT DE LA VALIDATION
router.put("/:id", validateId, validateIllustration, update);

// ✅ Supprimer une illustration
router.delete("/:id", validateId, remove);

module.exports = router;