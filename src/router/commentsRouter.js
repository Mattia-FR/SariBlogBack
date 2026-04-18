"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var rateLimit_1 = require("../config/rateLimit");
var commentsController_1 = require("../controller/commentsController");
var validateMiddleware_1 = require("../middleware/validateMiddleware");
var commentSchemas_1 = require("../schemas/commentSchemas");
var router = express_1.default.Router();
// Route pour récupérer les commentaires approuvés d'un article (public)
router.get("/article/:articleId", commentsController_1.readByArticleId);
// Créer un commentaire (public, modération via admin)
router.post("/", (0, validateMiddleware_1.validate)(commentSchemas_1.commentCreateSchema), rateLimit_1.commentsLimiter, commentsController_1.create);
exports.default = router;
