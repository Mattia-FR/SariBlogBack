const express = require("express");
const router = express.Router();

// On importe les routeurs
const articlesRouter = require("./articlesRouter");
const illustrationsRouter = require("./illustrationsRouter");

// On utilise les routeurs (montage sur l'API)
router.use("/articles", articlesRouter);
router.use("/illustrations", illustrationsRouter);

module.exports = router;
