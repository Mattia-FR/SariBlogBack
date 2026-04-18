"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
var zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().trim().min(1, "Identifiant requis"),
    password: zod_1.z.string().min(1, "Mot de passe requis"),
});
