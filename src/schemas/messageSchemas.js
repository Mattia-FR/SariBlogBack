"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageVisitorSchema = void 0;
var zod_1 = require("zod");
exports.messageVisitorSchema = zod_1.z.object({
    firstname: zod_1.z.string().trim().min(1, "Le prénom est requis"),
    lastname: zod_1.z.string().trim().min(1, "Le nom est requis"),
    email: zod_1.z.string().min(1, "L'email est requis").pipe(zod_1.z.email()),
    subject: zod_1.z.string().trim().min(1, "Le sujet est requis"),
    text: zod_1.z
        .string()
        .trim()
        .min(1, "Le message est requis")
        .max(5000, "Le message ne doit pas dépasser 5000 caractères"),
});
