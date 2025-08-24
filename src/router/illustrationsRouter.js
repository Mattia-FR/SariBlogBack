const express = require("express");
const router = express.Router();

const { getGalleryPreview } = require("../controller/illustrationsController");

// GET /api/illustrations/gallery-preview
router.get("/gallery-preview", getGalleryPreview);

module.exports = router;
