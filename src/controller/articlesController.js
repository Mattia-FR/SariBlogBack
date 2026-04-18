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
exports.readHomepagePreview = exports.readPublishedBySlug = exports.readPublishedById = exports.browsePublished = void 0;
var articlesModel_1 = __importDefault(require("../model/articlesModel"));
var httpErrors_1 = require("../utils/httpErrors");
var logger_1 = __importDefault(require("../utils/logger"));
// Liste les articles publiés (public). Option limit (max 20). Retourne Article[] avec imageUrl et tags.
// GET /articles/published?limit=4
var browsePublished = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, tagId, tagIdRaw, parsed, _a, articles, total, err_1;
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
                // Pour éviter que quelqu'un envoie "?page=-5" (qui serait truthy) et que la requête soit exécutée :
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
                return [4 /*yield*/, articlesModel_1.default.findPublished(page, limit, tagId)];
            case 1:
                _a = _b.sent(), articles = _a.articles, total = _a.total;
                res.status(200).json({ articles: articles, total: total, page: page, limit: limit });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                logger_1.default.error("Erreur lors de la récupération des articles publiés :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des articles publiés");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browsePublished = browsePublished;
// Récupère un article publié par ID (public). Retourne Article avec content et imageUrl.
// GET /articles/published/id/:id
var readPublishedById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, article, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                articleId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesModel_1.default.findPublishedById(articleId)];
            case 1:
                article = _a.sent();
                if (!article) {
                    (0, httpErrors_1.sendError)(res, 404, "Article publié non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(article);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'article publié par ID :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'article publié par ID");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readPublishedById = readPublishedById;
// Récupère un article publié par slug (public). Retourne Article avec content et imageUrl.
// GET /articles/published/slug/:slug
var readPublishedBySlug = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var slug, article, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                slug = req.params.slug;
                if (!slug) {
                    (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesModel_1.default.findPublishedBySlug(slug)];
            case 1:
                article = _a.sent();
                if (!article) {
                    (0, httpErrors_1.sendError)(res, 404, "Article publié non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(article);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'article publié par slug :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'article publié par slug");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readPublishedBySlug = readPublishedBySlug;
// Récupère les 4 derniers articles publiés pour la preview homepage (imageUrl + tags).
// GET /articles/homepage-preview
var readHomepagePreview = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articles, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, articlesModel_1.default.findHomepagePreview()];
            case 1:
                articles = _a.sent();
                res.status(200).json(articles);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de la preview homepage :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de la preview homepage");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readHomepagePreview = readHomepagePreview;
