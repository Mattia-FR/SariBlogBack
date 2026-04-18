"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var imagesController_1 = require("../controller/imagesController");
var router = express_1.default.Router();
// Route pour l'image du jour (doit être avant /:id pour éviter les conflits)
router.get("/image-of-the-day", imagesController_1.readImageOfTheDay);
// Route pour la galerie d'images (public)
router.get("/gallery", imagesController_1.browseGallery);
// Route pour récupérer les images d'un article (public)
router.get("/article/:articleId", imagesController_1.readByArticleId);
// Route pour récupérer les images par tag (public)
router.get("/tag/:tagId", imagesController_1.readByTag);
// Route pour récupérer les images de la galerie par catégorie (public)
router.get("/category/:categoryId", imagesController_1.readByCategoryId);
// Route pour récupérer une image par son ID (public)
// ⚠️ Doit être en dernier car /:id est générique et intercepterait /article/... et /tag/...
router.get("/:id", imagesController_1.readById);
exports.default = router;
