const express = require("express");
const router = express.Router();

const articlesRouter = require("./articlesRouter");
const illustrationsRouter = require("./illustrationsRouter");
const aboutRouter = require("./aboutRouter");
const contactRouter = require("./contactRouter");

// ✅ Routes API
router.use("/articles", articlesRouter);
router.use("/illustrations", illustrationsRouter);
router.use("/about", aboutRouter);
router.use("/contact", contactRouter);

module.exports = router;
