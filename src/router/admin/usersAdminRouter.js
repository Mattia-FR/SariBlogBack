"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var usersAdminController_1 = require("../../controller/admin/usersAdminController");
var router = express_1.default.Router();
// GET /admin/users/me — récupérer le profil de l'utilisateur connecté
router.get("/me", usersAdminController_1.readMe);
// PATCH /admin/users/me — modifier le profil de l'utilisateur connecté
router.patch("/me", usersAdminController_1.updateMeProfile);
// PATCH /admin/users/me/password — modifier le mot de passe de l'utilisateur connecté
router.patch("/me/password", usersAdminController_1.updateMePassword);
exports.default = router;
