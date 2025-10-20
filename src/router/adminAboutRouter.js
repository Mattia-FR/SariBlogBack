const express = require("express");
const router = express.Router();

const {
	read,
	update,
	updateContent,
	updateImage,
	getHistory
} = require("../controller/adminAboutController");
const { authenticateToken } = require("../middleware/auth");
const { validateAbout } = require("../middleware/validation");

// ✅ Toutes les routes admin nécessitent une authentification
router.use(authenticateToken);

// ✅ Récupérer le contenu "À propos" (admin)
router.get("/", read);

// ✅ Obtenir l'historique des modifications
router.get("/history", getHistory);

// ✅ Modifier le contenu "À propos" (complet)
router.put("/", validateAbout, update);

// ✅ Mettre à jour seulement le contenu
router.patch("/content", validateAbout, updateContent);

// ✅ Mettre à jour seulement l'image
router.patch("/image", validateAbout, updateImage);

module.exports = router;