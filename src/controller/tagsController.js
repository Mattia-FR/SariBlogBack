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
exports.readUsedOnGalleryByCategoryId = exports.readByImageId = exports.readByArticleId = exports.browseUsedOnPublishedArticles = void 0;
var tagsModel_1 = __importDefault(require("../model/tagsModel"));
var httpErrors_1 = require("../utils/httpErrors");
var logger_1 = __importDefault(require("../utils/logger"));
// Tags utilisés sur au moins un article publié (public, filtre blog).
// GET /tags/published-articles
var browseUsedOnPublishedArticles = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tags, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, tagsModel_1.default.findUsedOnPublishedArticles()];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags des articles publiés :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags des articles publiés");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseUsedOnPublishedArticles = browseUsedOnPublishedArticles;
// Tags utilisés sur au moins une image de galerie dans une catégorie (public).
// GET /tags/category/:categoryId
var readUsedOnGalleryByCategoryId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, tags, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                categoryId = Number.parseInt(req.params.categoryId, 10);
                if (Number.isNaN(categoryId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID de catégorie invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsModel_1.default.findUsedOnGalleryImagesByCategoryId(categoryId)];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags de galerie par catégorie :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags de galerie par catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readUsedOnGalleryByCategoryId = readUsedOnGalleryByCategoryId;
// Récupère tous les tags associés à un article par son ID (public)
// GET /tags/article/:articleId
var readByArticleId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, tags, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                articleId = Number.parseInt(req.params.articleId, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsModel_1.default.findByArticleId(articleId)];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags par ID d'article :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags par ID d'article");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readByArticleId = readByArticleId;
// Récupère tous les tags associés à une image par son ID (public)
// GET /tags/image/:imageId
var readByImageId = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var imageId, tags, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                imageId = Number.parseInt(req.params.imageId, 10);
                if (Number.isNaN(imageId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, tagsModel_1.default.findByImageId(imageId)];
            case 1:
                tags = _a.sent();
                res.status(200).json(tags);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération des tags par ID d'image :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des tags par ID d'image");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readByImageId = readByImageId;
