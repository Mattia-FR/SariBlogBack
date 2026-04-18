"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var categoriesController_1 = require("../controller/categoriesController");
var router = express_1.default.Router();
router.get("/", categoriesController_1.browseAll);
router.get("/:slug", categoriesController_1.getBySlug);
exports.default = router;
