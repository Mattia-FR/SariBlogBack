"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var authMiddleware_1 = require("../middleware/authMiddleware");
var roleMiddleware_1 = require("../middleware/roleMiddleware");
var admin_1 = __importDefault(require("./admin"));
var articlesRouter_1 = __importDefault(require("./articlesRouter"));
var authRouter_1 = __importDefault(require("./authRouter"));
var categoriesRouter_1 = __importDefault(require("./categoriesRouter"));
var commentsRouter_1 = __importDefault(require("./commentsRouter"));
var imagesRouter_1 = __importDefault(require("./imagesRouter"));
var messagesRouter_1 = __importDefault(require("./messagesRouter"));
var tagsRouter_1 = __importDefault(require("./tagsRouter"));
var usersRouter_1 = __importDefault(require("./usersRouter"));
var router = express_1.default.Router();
// Routes publiques
router.use("/articles", articlesRouter_1.default);
router.use("/images", imagesRouter_1.default);
router.use("/users", usersRouter_1.default);
router.use("/tags", tagsRouter_1.default);
router.use("/comments", commentsRouter_1.default);
router.use("/messages", messagesRouter_1.default);
router.use("/auth", authRouter_1.default);
router.use("/categories", categoriesRouter_1.default);
// Routes privées
router.use("/admin", authMiddleware_1.requireAuth, roleMiddleware_1.requireEditor, admin_1.default);
exports.default = router;
