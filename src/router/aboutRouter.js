const express = require("express");
const router = express.Router();

const { getAboutPreview } = require("../controller/aboutController");

// GET /api/about/about-preview
router.get("/about-preview", getAboutPreview);

module.exports = router;
