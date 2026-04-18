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
exports.readImageOfTheDay = exports.readByCategoryId = exports.readByTag = exports.readByArticleId = exports.readById = exports.browseGallery = void 0;
var imagesModel_1 = __importDefault(require("../model/imagesModel"));
var httpErrors_1 = require("../utils/httpErrors");
var imageUrl_1 = require("../utils/imageUrl");
var logger_1 = __importDefault(require("../utils/logger"));
/** Enrichit une image avec l'URL complète (path → imageUrl). */
function enrichWithImageUrl(item) {
    var _a;
    return __assign(__assign({}, item), { imageUrl: (_a = (0, imageUrl_1.buildImageUrl)(item.path)) !== null && _a !== void 0 ? _a : item.path });
}
// Liste les images de la galerie (is_in_gallery = TRUE) avec tags. Retourne Image[] + imageUrl.
// GET /images/gallery
var browseGallery = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var images, enrichedImages, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, imagesModel_1.default.findGallery()];
            case 1:
                images = _a.sent();
                enrichedImages = images.map(enrichWithImageUrl);
                res.status(200).json(enrichedImages);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de la galerie d'images :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de la galerie d'images");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseGallery = browseGallery;
// Récupère une image par ID. Retourne Image + imageUrl.
// GET /images/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var imageId, image, enrichedImage, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                imageId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(imageId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesModel_1.default.findById(imageId)];
            case 1:
                image = _a.sent();
                if (!image) {
                    (0, httpErrors_1.sendError)(res, 404, "Image non trouvée");
                    return [2 /*return*/];
                }
                enrichedImage = enrichWithImageUrl(image);
                res.status(200).json(enrichedImage);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'image par ID :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'image par ID");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Récupère les images associées à un article par ID. Retourne Image[] + imageUrl.
// GET /images/article/:articleId
var readByArticleId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, images, enrichedImages, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                articleId = Number.parseInt(req.params.articleId, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesModel_1.default.findByArticleId(articleId)];
            case 1:
                images = _a.sent();
                enrichedImages = images.map(enrichWithImageUrl);
                res.status(200).json(enrichedImages);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des images par ID d'article :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des images par ID d'article");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readByArticleId = readByArticleId;
// Récupère les images associées à un tag par ID. Retourne Image[] + imageUrl.
// GET /images/tag/:tagId
var readByTag = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tagId, images, enrichedImages, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                tagId = Number.parseInt(req.params.tagId, 10);
                if (Number.isNaN(tagId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, imagesModel_1.default.findByTagId(tagId)];
            case 1:
                images = _a.sent();
                enrichedImages = images.map(enrichWithImageUrl);
                res.status(200).json(enrichedImages);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des images par ID de tag :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des images par ID de tag");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readByTag = readByTag;
// Récupère les images de la galerie associées à une catégorie par ID (paginé). Retourne { images, total, page, limit } + imageUrl.
// GET /images/category/:categoryId?page=1&limit=10
var readByCategoryId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, page, limit, tagId, tagIdRaw, parsed, _a, images, total, enrichedImages, err_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                categoryId = Number.parseInt(req.params.categoryId, 10);
                if (Number.isNaN(categoryId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID de catégorie invalide");
                    return [2 /*return*/];
                }
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
                return [4 /*yield*/, imagesModel_1.default.findByCategoryId(categoryId, page, limit, tagId)];
            case 1:
                _a = _b.sent(), images = _a.images, total = _a.total;
                enrichedImages = images.map(enrichWithImageUrl);
                res.status(200).json({
                    images: enrichedImages,
                    total: total,
                    page: page,
                    limit: limit,
                });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _b.sent();
                logger_1.default.error("Erreur lors de la récupération des images par ID de catégorie :", err_5);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des images par ID de catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readByCategoryId = readByCategoryId;
// Récupère l'image du jour (galerie, déterministe par jour de l'année). Retourne Image + imageUrl.
// GET /images/image-of-the-day
var readImageOfTheDay = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var image, enrichedImage, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, imagesModel_1.default.findImageOfTheDay()];
            case 1:
                image = _a.sent();
                if (!image) {
                    (0, httpErrors_1.sendError)(res, 404, "Aucune image disponible dans la galerie");
                    return [2 /*return*/];
                }
                enrichedImage = enrichWithImageUrl(image);
                res.status(200).json(enrichedImage);
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'image du jour :", err_6);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'image du jour");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readImageOfTheDay = readImageOfTheDay;
