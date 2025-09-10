const express = require("express");
const router = express.Router();

const { sendMessage } = require("../controller/contactController");
const { validateContact } = require("../middleware/validation");
const { contactRateLimit } = require("../middleware/security");

// ✅ Envoyer un message de contact
router.post("/", contactRateLimit, validateContact, sendMessage);

module.exports = router;
