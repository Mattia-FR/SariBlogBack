const express = require("express");
const router = express.Router();

const { browse, read, getLatest } = require("../controller/articlesController");

// GET /api/articles (tous les articles avec pagination)
router.get("/", browse);

// GET /api/articles/latest?limit=4
router.get("/latest", getLatest);

// GET /api/articles/:slug (article complet par slug)
// On la place à la fin vu que c'est une route générique
// On évite ainsi qu'elle capture /latest
router.get("/:slug", read);

module.exports = router;
