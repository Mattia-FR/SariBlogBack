const express = require("express");
const router = express.Router();

const articlesRouter = require("./articlesRouter");
router.use("/articles", articlesRouter);

module.exports = router;
