"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var messagesAdminController_1 = require("../../controller/admin/messagesAdminController");
var router = express_1.default.Router();
router.get("/", messagesAdminController_1.browseAll);
router.get("/:id", messagesAdminController_1.readById);
router.patch("/:id/status", messagesAdminController_1.editStatus);
router.delete("/:id", messagesAdminController_1.destroy);
exports.default = router;
