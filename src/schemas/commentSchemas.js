"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentCreateSchema = void 0;
var zod_1 = require("zod");
exports.commentCreateSchema = zod_1.z.object({
    article_id: zod_1.z.coerce
        .number()
        .int()
        .positive("L'ID de l'article doit être un entier positif"),
    text: zod_1.z
        .string()
        .trim()
        .min(1, "Le commentaire ne peut pas être vide")
        .max(2000, "Le commentaire ne doit pas dépasser 2000 caractères"),
    firstname: zod_1.z.string().trim().min(1, "Le prénom est requis"),
    lastname: zod_1.z.string().trim().min(1, "Le nom est requis"),
    email: zod_1.z.string().min(1, "L'email est requis").pipe(zod_1.z.email()),
});
