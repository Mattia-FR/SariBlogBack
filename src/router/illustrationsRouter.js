const express = require("express");
const router = express.Router();

const {
	getGalleryPreview,
	browse,
	read,
} = require("../controller/illustrationsController");
const { validatePagination, validateId } = require("../middleware/validation");
const { browseRateLimit } = require("../middleware/security");

// ✅ Appliquer le rate limit de navigation à toutes les routes d'illustrations
router.use(browseRateLimit);

// ✅ Homepage - 6 illustrations pour le carrousel
router.get("/gallery-preview", validatePagination, getGalleryPreview);

// ✅ Page galerie - toutes les illustrations avec pagination
router.get("/", validatePagination, browse);

// ✅ Illustration individuelle par ID
router.get("/:id", validateId, read);

module.exports = router;
