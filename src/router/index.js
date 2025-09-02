const express = require("express");
const router = express.Router();

// On importe les routeurs
const articlesRouter = require("./articlesRouter");
const illustrationsRouter = require("./illustrationsRouter");
const aboutRouter = require("./aboutRouter");

// On utilise les routeurs (montage sur l'API)
router.use("/articles", articlesRouter);
router.use("/illustrations", illustrationsRouter);
router.use("/about", aboutRouter);

module.exports = router;
