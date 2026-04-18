"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var articlesAdminRouter_1 = __importDefault(require("./articlesAdminRouter"));
var categoriesAdminRouter_1 = __importDefault(require("./categoriesAdminRouter"));
var commentsAdminRouter_1 = __importDefault(require("./commentsAdminRouter"));
var dashboardAdminRouter_1 = __importDefault(require("./dashboardAdminRouter"));
var imagesAdminRouter_1 = __importDefault(require("./imagesAdminRouter"));
var messagesAdminRouter_1 = __importDefault(require("./messagesAdminRouter"));
var tagsAdminRouter_1 = __importDefault(require("./tagsAdminRouter"));
var usersAdminRouter_1 = __importDefault(require("./usersAdminRouter"));
var router = express_1.default.Router();
// Toutes les routes sont protégées par requireAuth + requireEditor (montage dans router/index.ts)
router.use("/articles", articlesAdminRouter_1.default);
router.use("/images", imagesAdminRouter_1.default);
router.use("/messages", messagesAdminRouter_1.default);
router.use("/comments", commentsAdminRouter_1.default);
router.use("/dashboard", dashboardAdminRouter_1.default);
router.use("/tags", tagsAdminRouter_1.default);
router.use("/categories", categoriesAdminRouter_1.default);
router.use("/users", usersAdminRouter_1.default);
exports.default = router;
