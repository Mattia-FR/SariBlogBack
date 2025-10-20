const express = require("express");
const router = express.Router();

const articlesRouter = require("./articlesRouter");
const illustrationsRouter = require("./illustrationsRouter");
const aboutRouter = require("./aboutRouter");
const contactRouter = require("./contactRouter");
const authRouter = require("./authRouter");
const adminArticlesRouter = require("./adminArticlesRouter");
const adminIllustrationsRouter = require("./adminIllustrationsRouter");
const adminMessagesRouter = require("./adminMessagesRouter");
const adminAboutRouter = require("./adminAboutRouter");
const adminTagsRouter = require("./adminTagsRouter");
const uploadRouter = require("./uploadRouter");

// ✅ Routes API publiques
router.use("/articles", articlesRouter);
router.use("/illustrations", illustrationsRouter);
router.use("/about", aboutRouter);
router.use("/contact", contactRouter);

// ✅ Routes d'authentification
router.use("/auth", authRouter);

// ✅ Routes admin
router.use("/admin/articles", adminArticlesRouter);
router.use("/admin/illustrations", adminIllustrationsRouter);
router.use("/admin/messages", adminMessagesRouter);
router.use("/admin/about", adminAboutRouter);
router.use("/admin/tags", adminTagsRouter);
router.use("/admin/upload", uploadRouter);

module.exports = router;
