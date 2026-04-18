"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var rateLimit_1 = require("../config/rateLimit");
var authController_1 = require("../controller/authController");
var validateMiddleware_1 = require("../middleware/validateMiddleware");
var authSchemas_1 = require("../schemas/authSchemas");
var router = express_1.default.Router();
router.post("/login", (0, validateMiddleware_1.validate)(authSchemas_1.loginSchema), rateLimit_1.loginLimiter, authController_1.login);
router.post("/refresh", authController_1.refresh);
router.post("/logout", authController_1.logout);
exports.default = router;
