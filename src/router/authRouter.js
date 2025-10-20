const express = require("express");
const router = express.Router();

const { login, verifyToken, logout } = require("../controller/authController");
const { authenticateToken } = require("../middleware/auth");
const { validateLogin } = require("../middleware/validation");
const { authRateLimit } = require("../middleware/security");

// Connexion avec rate limiting et validation
router.post("/login", authRateLimit, validateLogin, login);

// Vérifier le token
router.get("/verify", authenticateToken, verifyToken);

// Déconnexion
router.post("/logout", authenticateToken, logout);

module.exports = router;