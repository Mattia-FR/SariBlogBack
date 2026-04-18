"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var articlesController_1 = require("../controller/articlesController");
var router = express_1.default.Router();
// ⚠️ ORDRE IMPORTANT : Les routes spécifiques doivent être AVANT les routes génériques
router.get("/homepage-preview", articlesController_1.readHomepagePreview);
router.get("/published", articlesController_1.browsePublished);
// Chemins distincts pour éviter l'ambiguïté id vs slug :
router.get("/published/id/:id", articlesController_1.readPublishedById);
router.get("/published/slug/:slug", articlesController_1.readPublishedBySlug);
exports.default = router;
