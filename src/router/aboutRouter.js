const express = require("express");
const router = express.Router();

const { getAbout } = require("../controller/aboutController");
const { browseRateLimit } = require("../middleware/security");

// ✅ Appliquer le rate limit de navigation à la route about
router.use(browseRateLimit);

router.get("/", getAbout);

module.exports = router;
