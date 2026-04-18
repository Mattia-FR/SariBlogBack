"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destroy = exports.edit = exports.add = exports.readById = exports.browseUsedOnImages = exports.browseUsedOnArticles = exports.browseAll = void 0;
var tagsAdminModel_1 = __importDefault(require("../../model/admin/tagsAdminModel"));
var httpErrors_1 = require("../../utils/httpErrors");
var logger_1 = __importDefault(require("../../utils/logger"));
var slug_1 = require("../../utils/slug");
// Liste tous les tags (y compris non utilisés).
// GET /admin/tags
var browseAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tags, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagsAdminModel_1.default.findAll()];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags (admin) :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseAll = browseAll;
// Tags utilisés sur au moins un article (tous statuts), filtre liste articles admin.
// GET /admin/tags/used-on-articles
var browseUsedOnArticles = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tags, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagsAdminModel_1.default.findUsedOnArticles()];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags utilisés sur des articles :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags utilisés sur des articles");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseUsedOnArticles = browseUsedOnArticles;
// Tags utilisés sur au moins une image (filtre liste images admin).
// GET /admin/tags/used-on-images
var browseUsedOnImages = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tags, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagsAdminModel_1.default.findUsedOnImages()];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags utilisés sur des images :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags utilisés sur des images");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseUsedOnImages = browseUsedOnImages;
// Récupère un tag par ID.
// GET /admin/tags/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagId, tag, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tagId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(tagId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsAdminModel_1.default.findById(tagId)];
            case 1:
                tag = _a.sent();
                if (!tag) {
                    (0, httpErrors_1.sendError)(res, 404, "Tag non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(tag);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération du tag par ID (admin) :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération du tag");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Crée un tag. Body : name (requis), slug (optionnel, déduit du name si absent).
// POST /admin/tags
var add = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name_1, slugProvided, slug, newTag, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                name_1 = typeof req.body.name === "string" ? req.body.name.trim() : "";
                if (!name_1) {
                    (0, httpErrors_1.sendError)(res, 400, "Le nom est requis");
                    return [2 /*return*/];
                }
                slugProvided = req.body.slug && typeof req.body.slug === "string"
                    ? req.body.slug.trim()
                    : "";
                slug = void 0;
                if (slugProvided) {
                    slug = (0, slug_1.buildSlug)(slugProvided);
                    if (!slug) {
                        (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                        return [2 /*return*/];
                    }
                }
                else {
                    slug = (0, slug_1.buildSlug)(name_1);
                }
                return [4 /*yield*/, tagsAdminModel_1.default.create({ name: name_1, slug: slug })];
            case 1:
                newTag = _a.sent();
                res.status(201).json(newTag);
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                logger_1.default.error("Erreur lors de la création du tag (admin) :", err_5);
                if (err_5 instanceof Error && err_5.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Un tag avec ce nom ou ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la création du tag");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.add = add;
// Met à jour un tag. Body : name et/ou slug (optionnels, mise à jour partielle).
// PATCH /admin/tags/:id
var edit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagId, data, _a, name_2, slug, trimmed, trimmed, sanitized, updatedTag, err_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                tagId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(tagId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                data = {};
                _a = req.body, name_2 = _a.name, slug = _a.slug;
                if (name_2 !== undefined) {
                    trimmed = typeof name_2 === "string" ? name_2.trim() : "";
                    if (trimmed)
                        data.name = trimmed;
                }
                if (slug !== undefined) {
                    trimmed = typeof slug === "string" ? slug.trim() : "";
                    if (trimmed) {
                        sanitized = (0, slug_1.buildSlug)(trimmed);
                        if (!sanitized) {
                            (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                            return [2 /*return*/];
                        }
                        data.slug = sanitized;
                    }
                }
                if (Object.keys(data).length === 0) {
                    (0, httpErrors_1.sendError)(res, 400, "Au moins un champ (name ou slug) doit être fourni et non vide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsAdminModel_1.default.update(tagId, data)];
            case 1:
                updatedTag = _b.sent();
                if (!updatedTag) {
                    (0, httpErrors_1.sendError)(res, 404, "Tag non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(updatedTag);
                return [3 /*break*/, 3];
            case 2:
                err_6 = _b.sent();
                logger_1.default.error("Erreur lors de la mise à jour du tag (admin) :", err_6);
                if (err_6 instanceof Error && err_6.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Un tag avec ce nom ou ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour du tag");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.edit = edit;
// Supprime un tag par ID.
// DELETE /admin/tags/:id
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagId, deleted, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tagId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(tagId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsAdminModel_1.default.deleteOne(tagId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    (0, httpErrors_1.sendError)(res, 404, "Tag non trouvé");
                    return [2 /*return*/];
                }
                res.sendStatus(204);
                return [3 /*break*/, 3];
            case 2:
                err_7 = _a.sent();
                logger_1.default.error("Erreur lors de la suppression du tag (admin) :", err_7);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la suppression du tag");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.destroy = destroy;
