const express = require("express");
const router = express.Router();

const {
	browse,
	read,
	create,
	update,
	remove,
	changePassword,
	toggleActive,
	getStats,
} = require("../controller/adminUsersController");

const { authenticateToken, requireRole } = require("../middleware/auth");
const {
	validatePagination,
	validateId,
	validateUser,
	validateUserUpdate,
	validatePasswordChange,
} = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification et le rôle admin
router.use(authenticateToken);
router.use(requireRole(["admin"]));

// ✅ Obtenir les statistiques des utilisateurs
router.get("/stats", getStats);

// ✅ Lister tous les utilisateurs (admin)
router.get("/", validatePagination, browse);

// ✅ Récupérer un utilisateur par ID (admin)
router.get("/:id", validateId, read);

// ✅ Créer un nouvel utilisateur
router.post("/", validateUser, create);

// ✅ Modifier un utilisateur
router.put("/:id", validateId, validateUserUpdate, update);

// ✅ Changer le mot de passe d'un utilisateur
router.patch(
	"/:id/change-password",
	validateId,
	validatePasswordChange,
	changePassword,
);

// ✅ Activer/désactiver un utilisateur
router.patch("/:id/toggle-active", validateId, toggleActive);

// ✅ Supprimer un utilisateur (désactiver)
router.delete("/:id", validateId, remove);

module.exports = router;
