"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var categoriesAdminController_1 = require("../../controller/admin/categoriesAdminController");
var categoriesController_1 = require("../../controller/categoriesController");
var router = express_1.default.Router();
router.get("/", categoriesController_1.browseAll);
router.get("/:id", categoriesAdminController_1.readById);
router.post("/", categoriesAdminController_1.add);
router.patch("/:id", categoriesAdminController_1.edit);
router.delete("/:id", categoriesAdminController_1.destroy);
exports.default = router;
