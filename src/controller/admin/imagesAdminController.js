"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.destroy = exports.edit = exports.add = exports.readById = exports.browseAll = void 0;
var promises_1 = __importDefault(require("node:fs/promises"));
var node_path_1 = __importDefault(require("node:path"));
var imagesAdminModel_1 = __importDefault(require("../../model/admin/imagesAdminModel"));
var httpErrors_1 = require("../../utils/httpErrors");
var imageUrl_1 = require("../../utils/imageUrl");
var logger_1 = __importDefault(require("../../utils/logger"));
function enrichWithImageUrl(item) {
    var _a;
    return __assign(__assign({}, item), { imageUrl: (_a = (0, imageUrl_1.buildImageUrl)(item.path)) !== null && _a !== void 0 ? _a : item.path });
}
// Liste les images (admin), paginée. Query : page, limit (1–20), tagId optionnel.
// GET /admin/images?page=1&limit=10&tagId=2
var browseAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, tagId, tagIdRaw, parsed, _a, images, total, enriched, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                page = Number.parseInt(req.query.page, 10) || 1;
                limit = Number.parseInt(req.query.limit, 10) || 10;
                if (page < 1) {
                    (0, httpErrors_1.sendError)(res, 400, "Le paramètre page doit être un nombre positif");
                    return [2 /*return*/];
                }
                if (limit < 1 || limit > 20) {
                    (0, httpErrors_1.sendError)(res, 400, "Le paramètre limit doit être entre 1 et 20");
                    return [2 /*return*/];
                }
                tagId = void 0;
                tagIdRaw = req.query.tagId;
                if (tagIdRaw !== undefined && tagIdRaw !== "") {
                    parsed = Number.parseInt(String(tagIdRaw), 10);
                    if (Number.isNaN(parsed) || parsed < 1) {
                        (0, httpErrors_1.sendError)(res, 400, "Le paramètre tagId doit être un nombre positif");
                        return [2 /*return*/];
                    }
                    tagId = parsed;
                }
                return [4 /*yield*/, imagesAdminModel_1.default.findAllPaginated(page, limit, tagId)];
            case 1:
                _a = _b.sent(), images = _a.images, total = _a.total;
                enriched = images.map(enrichWithImageUrl);
                res.status(200).json({
                    images: enriched,
                    total: total,
                    page: page,
                    limit: limit,
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                logger_1.default.error("Erreur lors de la récupération des images (admin) :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des images");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseAll = browseAll;
// Récupère une image par ID (admin).
// GET /admin/images/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, image, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(id)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesAdminModel_1.default.findById(id)];
            case 1:
                image = _a.sent();
                if (!image) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                res.status(200).json(enrichWithImageUrl(image));
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'image par ID (admin) :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'image");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Crée une image. user_id pris du JWT. Body : path (requis), title, description, alt_descr, is_in_gallery, article_id, category_id.
// POST /admin/images
var add = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, path_1, _a, title, description, alt_descr, article_id, category_id, tagIds, parsed, isInGallery, resolvedCategoryId, image, err_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.userId;
                if (!userId) {
                    (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
                    return [2 /*return*/];
                }
                if (!req.file) {
                    (0, httpErrors_1.sendError)(res, 400, "Fichier image requis");
                    return [2 /*return*/];
                }
                path_1 = "/uploads/images/".concat(req.file.filename);
                _a = req.body, title = _a.title, description = _a.description, alt_descr = _a.alt_descr, article_id = _a.article_id, category_id = _a.category_id;
                tagIds = [];
                if (Array.isArray(req.body.tag_ids)) {
                    tagIds = req.body.tag_ids
                        .map(function (id) { return Number(id); })
                        .filter(function (id) { return !Number.isNaN(id); });
                }
                else if (typeof req.body.tag_ids === "string") {
                    try {
                        parsed = JSON.parse(req.body.tag_ids);
                        tagIds = Array.isArray(parsed)
                            ? parsed.map(function (id) { return Number(id); }).filter(function (id) { return !Number.isNaN(id); })
                            : [];
                    }
                    catch (_d) {
                        // ignore invalid JSON
                    }
                }
                isInGallery = req.body.is_in_gallery === "true" || req.body.is_in_gallery === "on";
                resolvedCategoryId = category_id != null && category_id !== "" ? Number(category_id) : null;
                if (!isInGallery) {
                    resolvedCategoryId = null;
                }
                else if (resolvedCategoryId === null ||
                    Number.isNaN(resolvedCategoryId) ||
                    resolvedCategoryId < 1) {
                    (0, httpErrors_1.sendError)(res, 400, "Une catégorie est requise pour une image affichée dans la galerie");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesAdminModel_1.default.create({
                        path: path_1,
                        user_id: userId,
                        title: (title === null || title === void 0 ? void 0 : title.trim()) || null,
                        description: (description === null || description === void 0 ? void 0 : description.trim()) || null,
                        alt_descr: (alt_descr === null || alt_descr === void 0 ? void 0 : alt_descr.trim()) || null,
                        is_in_gallery: isInGallery,
                        article_id: article_id != null && article_id !== "" ? Number(article_id) : null,
                        category_id: resolvedCategoryId,
                        tag_ids: tagIds.length > 0 ? tagIds : undefined,
                    })];
            case 1:
                image = _c.sent();
                res.status(201).json(enrichWithImageUrl(image));
                return [3 /*break*/, 3];
            case 2:
                err_3 = _c.sent();
                logger_1.default.error("Erreur lors de la création de l'image (admin) :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la création de l'image");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.add = add;
// Met à jour une image. Body : champs optionnels (title, description, alt_descr, is_in_gallery, article_id, category_id). Le fichier image n'est pas modifié.
// PATCH /admin/images/:id
var edit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, existing, data, _a, title, description, alt_descr, is_in_gallery, article_id, category_id, tagIds, finalInGallery, mergedCategoryId, image, err_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(id)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesAdminModel_1.default.findById(id)];
            case 1:
                existing = _b.sent();
                if (!existing) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                data = {};
                _a = req.body, title = _a.title, description = _a.description, alt_descr = _a.alt_descr, is_in_gallery = _a.is_in_gallery, article_id = _a.article_id, category_id = _a.category_id;
                if (title !== undefined)
                    data.title = title !== null && title !== void 0 ? title : null;
                if (description !== undefined)
                    data.description = description !== null && description !== void 0 ? description : null;
                if (alt_descr !== undefined)
                    data.alt_descr = alt_descr !== null && alt_descr !== void 0 ? alt_descr : null;
                if (is_in_gallery !== undefined)
                    data.is_in_gallery = Boolean(is_in_gallery);
                if (article_id !== undefined)
                    data.article_id = article_id != null ? Number(article_id) : null;
                if (category_id !== undefined)
                    data.category_id = category_id != null ? Number(category_id) : null;
                if (req.body.tag_ids !== undefined) {
                    tagIds = Array.isArray(req.body.tag_ids)
                        ? req.body.tag_ids
                            .map(function (id) { return Number(id); })
                            .filter(function (id) { return !Number.isNaN(id); })
                        : [];
                    data.tag_ids = tagIds;
                }
                finalInGallery = data.is_in_gallery !== undefined
                    ? data.is_in_gallery
                    : existing.is_in_gallery;
                if (!finalInGallery) {
                    data.category_id = null;
                }
                else {
                    mergedCategoryId = data.category_id !== undefined
                        ? data.category_id
                        : existing.category_id;
                    if (mergedCategoryId === null ||
                        mergedCategoryId === undefined ||
                        Number.isNaN(Number(mergedCategoryId)) ||
                        Number(mergedCategoryId) < 1) {
                        (0, httpErrors_1.sendError)(res, 400, "Une catégorie est requise pour une image affichée dans la galerie");
                        return [2 /*return*/];
                    }
                }
                return [4 /*yield*/, imagesAdminModel_1.default.update(id, data)];
            case 2:
                image = _b.sent();
                if (!image) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                res.status(200).json(enrichWithImageUrl(image));
                return [3 /*break*/, 4];
            case 3:
                err_4 = _b.sent();
                logger_1.default.error("Erreur lors de la mise à jour de l'image (admin) :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour de l'image");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.edit = edit;
// Supprime une image.
// DELETE /admin/images/:id
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, image, deleted, relativeImagePath, fullPath, unlinkErr_1, err, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                id = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(id)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesAdminModel_1.default.findById(id)];
            case 1:
                image = _a.sent();
                if (!image) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesAdminModel_1.default.deleteOne(id)];
            case 2:
                deleted = _a.sent();
                if (!deleted) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                relativeImagePath = image.path.replace(/^\/+/, "");
                fullPath = node_path_1.default.join(process.cwd(), relativeImagePath);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, promises_1.default.unlink(fullPath)];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                unlinkErr_1 = _a.sent();
                err = unlinkErr_1;
                // ENOENT = "file not found" : le fichier n'existe pas (déjà supprimé, ou chemin correct mais absent).
                // On l'ignore pour que la suppression DB reste idempotente côté API.
                // (suppression DB ok même si le fichier n’est déjà plus là)
                if ((err === null || err === void 0 ? void 0 : err.code) !== "ENOENT") {
                    logger_1.default.error("Erreur lors de la suppression du fichier image :", err);
                }
                return [3 /*break*/, 6];
            case 6:
                res.sendStatus(204);
                return [3 /*break*/, 8];
            case 7:
                err_5 = _a.sent();
                logger_1.default.error("Erreur lors de la suppression de l'image (admin) :", err_5);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la suppression de l'image");
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.destroy = destroy;
