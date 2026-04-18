"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var multer_1 = require("../../config/multer");
var imagesAdminController_1 = require("../../controller/admin/imagesAdminController");
var router = express_1.default.Router();
// GET /admin/images — liste toutes les images
router.get("/", imagesAdminController_1.browseAll);
// GET /admin/images/:id — détail d'une image
router.get("/:id", imagesAdminController_1.readById);
// POST /admin/images — créer une image
router.post("/", multer_1.uploadImage.single("image"), imagesAdminController_1.add);
// PATCH /admin/images/:id — modifier une image (métadonnées uniquement, pas de nouvel upload)
router.patch("/:id", imagesAdminController_1.edit);
// DELETE /admin/images/:id — supprimer une image
router.delete("/:id", imagesAdminController_1.destroy);
exports.default = router;
