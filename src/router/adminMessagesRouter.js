const express = require("express");
const router = express.Router();

const {
	browse,
	read,
	markAsRead,
	markAsUnread,
	markAllAsRead,
	remove,
	removeAllRead,
	getStats,
} = require("../controller/adminMessagesController");
const { authenticateToken } = require("../middleware/auth");
const { validatePagination, validateId } = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Obtenir les statistiques des messages
router.get("/stats", getStats);

// ✅ Lister tous les messages (admin)
router.get("/", validatePagination, browse);

// ✅ Récupérer un message par ID (admin)
router.get("/:id", validateId, read);

// ✅ Marquer un message comme lu
router.put("/:id/read", validateId, markAsRead); // ✅ Changé de PATCH à PUT

// ✅ Marquer un message comme non lu
router.put("/:id/unread", validateId, markAsUnread); // ✅ Changé de PATCH à PUT

// ✅ Marquer tous les messages comme lus
router.put("/read-all", markAllAsRead); // ✅ Changé de PATCH à PUT

// ✅ Supprimer un message
router.delete("/:id", validateId, remove);

// ✅ Supprimer tous les messages lus
router.delete("/read-all", removeAllRead); // ✅ Changé de remove-read à read-all

module.exports = router;
