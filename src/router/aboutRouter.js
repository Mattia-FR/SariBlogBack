const express = require("express");
const router = express.Router();

const { getAbout } = require("../controller/aboutController");

router.get("/", getAbout);

module.exports = router;
