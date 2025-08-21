const express = require("express");
const router = express.Router();

const { getLatestPublished } = require("../controller/articlesController");

// GET /api/articles/latest?limit=4
router.get("/latest", getLatestPublished);

module.exports = router;
