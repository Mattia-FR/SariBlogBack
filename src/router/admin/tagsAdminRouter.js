"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var tagsAdminController_1 = require("../../controller/admin/tagsAdminController");
var router = express_1.default.Router();
router.get("/", tagsAdminController_1.browseAll);
router.get("/used-on-articles", tagsAdminController_1.browseUsedOnArticles);
router.get("/used-on-images", tagsAdminController_1.browseUsedOnImages);
router.get("/:id", tagsAdminController_1.readById);
router.post("/", tagsAdminController_1.add);
router.patch("/:id", tagsAdminController_1.edit);
router.delete("/:id", tagsAdminController_1.destroy);
exports.default = router;
