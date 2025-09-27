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
	getStats
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
router.patch("/:id/read", validateId, markAsRead);

// ✅ Marquer un message comme non lu
router.patch("/:id/unread", validateId, markAsUnread);

// ✅ Marquer tous les messages comme lus
router.patch("/mark-all-read", markAllAsRead);

// ✅ Supprimer un message
router.delete("/:id", validateId, remove);

// ✅ Supprimer tous les messages lus
router.delete("/remove-read", removeAllRead);

module.exports = router;