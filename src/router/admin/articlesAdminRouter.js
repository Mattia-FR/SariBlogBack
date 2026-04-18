"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var articlesAdminController_1 = require("../../controller/admin/articlesAdminController");
var router = express_1.default.Router();
// Liste tous les articles (tous statuts)
// GET /admin/articles
router.get("/", articlesAdminController_1.browseAll);
// Article par slug
// GET /admin/articles/slug/:slug
router.get("/slug/:slug", articlesAdminController_1.readBySlug);
// Article par ID avec détails complets
// GET /admin/articles/:id
router.get("/:id", articlesAdminController_1.readById);
// CRUD :
router.post("/", articlesAdminController_1.add); // Créer
router.patch("/:id", articlesAdminController_1.edit); // Modifier
router.delete("/:id", articlesAdminController_1.destroy); // Supprimer
exports.default = router;
