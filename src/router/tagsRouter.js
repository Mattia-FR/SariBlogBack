"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tagsController_1 = require("../controller/tagsController");
var router = express_1.default.Router();
// Avant /article/:id pour ne pas confondre avec un segment dynamique
router.get("/published-articles", tagsController_1.browseUsedOnPublishedArticles);
router.get("/category/:categoryId", tagsController_1.readUsedOnGalleryByCategoryId);
// Route pour récupérer les tags d'un article (public)
router.get("/article/:articleId", tagsController_1.readByArticleId);
// Route pour récupérer les tags d'une image (public)
router.get("/image/:imageId", tagsController_1.readByImageId);
exports.default = router;
