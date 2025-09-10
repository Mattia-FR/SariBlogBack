const express = require("express");
const router = express.Router();

const {
	getLatest,
	browse,
	readBySlug,
} = require("../controller/articlesController");
const {
	validatePagination,
	validateSlug,
} = require("../middleware/validation");

// ✅ Homepage - 4 derniers articles
router.get("/latest", validatePagination, getLatest);

// ✅ Page blog - tous les articles avec pagination
router.get("/", validatePagination, browse);

// ✅ Article individuel par slug
router.get("/slug/:slug", validateSlug, readBySlug);

module.exports = router;
