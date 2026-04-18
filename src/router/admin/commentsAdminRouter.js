"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var commentsAdminController_1 = require("../../controller/admin/commentsAdminController");
var router = express_1.default.Router();
router.get("/", commentsAdminController_1.browseAll);
router.get("/:id", commentsAdminController_1.readById);
router.patch("/:id/status", commentsAdminController_1.editStatus);
router.delete("/:id", commentsAdminController_1.destroy);
exports.default = router;
