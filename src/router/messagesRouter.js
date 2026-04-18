"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var rateLimit_1 = require("../config/rateLimit");
var messagesController_1 = require("../controller/messagesController");
var validateMiddleware_1 = require("../middleware/validateMiddleware");
var messageSchemas_1 = require("../schemas/messageSchemas");
var router = express_1.default.Router();
router.post("/", (0, validateMiddleware_1.validate)(messageSchemas_1.messageVisitorSchema), rateLimit_1.messagesLimiter, messagesController_1.add);
exports.default = router;
