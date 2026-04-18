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
exports.destroy = exports.edit = exports.add = exports.readById = exports.readBySlug = exports.browseAll = void 0;
var articlesAdminModel_1 = __importDefault(require("../../model/admin/articlesAdminModel"));
var excerpt_1 = require("../../utils/excerpt");
var httpErrors_1 = require("../../utils/httpErrors");
var logger_1 = __importDefault(require("../../utils/logger"));
var publishedAt_1 = require("../../utils/publishedAt");
var slug_1 = require("../../utils/slug");
var VALID_STATUSES = ["draft", "published", "archived"];
// Liste paginée (tous statuts) avec tags. Query : page, limit (1–20), tagId optionnel.
// GET /admin/articles?page=1&limit=10&tagId=2
var browseAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
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
                return [4 /*yield*/, articlesAdminModel_1.default.findAllForAdminPaginated(page, limit, tagId)];
            case 1:
                _a = _b.sent(), articles = _a.articles, total = _a.total;
                res.status(200).json({
                    articles: articles,
                    total: total,
                    page: page,
                    limit: limit,
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _b.sent();
                logger_1.default.error("Erreur lors de la récupération des articles (admin) :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des articles");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseAll = browseAll;
// Récupère un article par slug (tous statuts). Retourne Article avec content et imageUrl.
// GET /admin/articles/slug/:slug
var readBySlug = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var slug, article, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                slug = req.params.slug;
                if (!slug) {
                    (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesAdminModel_1.default.findBySlugForAdmin(slug)];
            case 1:
                article = _a.sent();
                if (!article) {
                    (0, httpErrors_1.sendError)(res, 404, "Article non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(article);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'article par slug :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'article par slug");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readBySlug = readBySlug;
// Récupère un article par ID avec content, imageUrl, tags et comments_count.
// GET /admin/articles/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, article, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                articleId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesAdminModel_1.default.findByIdForAdmin(articleId)];
            case 1:
                article = _a.sent();
                if (!article) {
                    (0, httpErrors_1.sendError)(res, 404, "Article non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(article);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'article par ID (admin) :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'article");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Crée un nouvel article. user_id pris du JWT. Body : ArticleCreateData (sans user_id).
// POST /admin/articles
var add = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, title, slugProvided, finalSlug, tagIds, rawStatus, status_1, rawFeatured, featured_image_id, published_atRaw, published_at, content, manualExcerpt, excerpt, articleData, newArticle, err_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
                if (!userId) {
                    (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
                    return [2 /*return*/];
                }
                title = typeof req.body.title === "string" ? req.body.title.trim() : "";
                if (!title) {
                    (0, httpErrors_1.sendError)(res, 400, "Le titre est requis");
                    return [2 /*return*/];
                }
                slugProvided = req.body.slug && typeof req.body.slug === "string"
                    ? req.body.slug.trim()
                    : "";
                finalSlug = void 0;
                if (slugProvided) {
                    finalSlug = (0, slug_1.buildSlug)(slugProvided);
                    if (!finalSlug) {
                        (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                        return [2 /*return*/];
                    }
                }
                else {
                    finalSlug = (0, slug_1.buildSlug)(title);
                }
                tagIds = Array.isArray(req.body.tag_ids)
                    ? req.body.tag_ids
                        .map(function (id) { return Number(id); })
                        .filter(function (id) { return !Number.isNaN(id); })
                    : [];
                rawStatus = req.body.status;
                status_1 = typeof rawStatus === "string" &&
                    VALID_STATUSES.includes(rawStatus)
                    ? rawStatus
                    : "draft";
                rawFeatured = req.body.featured_image_id;
                featured_image_id = rawFeatured != null && rawFeatured !== ""
                    ? Number(rawFeatured) || null
                    : null;
                published_atRaw = req.body.published_at != null && req.body.published_at !== ""
                    ? String(req.body.published_at)
                    : null;
                published_at = (0, publishedAt_1.publishedAtForCreate)(status_1, published_atRaw);
                content = typeof req.body.content === "string" ? req.body.content : "";
                manualExcerpt = req.body.excerpt != null && req.body.excerpt !== ""
                    ? String(req.body.excerpt).trim()
                    : null;
                excerpt = manualExcerpt !== null && manualExcerpt !== void 0 ? manualExcerpt : (0, excerpt_1.excerptFromPlainText)(content);
                articleData = {
                    title: title,
                    slug: finalSlug,
                    content: content,
                    excerpt: excerpt,
                    status: status_1,
                    user_id: userId,
                    featured_image_id: featured_image_id,
                    published_at: published_at,
                    tag_ids: tagIds,
                };
                return [4 /*yield*/, articlesAdminModel_1.default.create(articleData)];
            case 1:
                newArticle = _b.sent();
                res.status(201).json(newArticle);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _b.sent();
                logger_1.default.error("Erreur lors de la création de l'article (admin) :", err_4);
                if (err_4 instanceof Error && err_4.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Un article avec ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la création de l'article");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.add = add;
// Met à jour un article. Body : ArticleUpdateData (champs partiels).
// PUT /admin/articles/:id
var edit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, existingArticle, tagIds, articleData, trimmedSlug, sanitized, explicitExcerptNonEmpty, rawStatusEdit, rawFeaturedEdit, mergedStatus, mergedPublishedAt, updatedArticle, err_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                articleId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesAdminModel_1.default.findByIdForAdmin(articleId)];
            case 1:
                existingArticle = _b.sent();
                if (!existingArticle) {
                    (0, httpErrors_1.sendError)(res, 404, "Article non trouvé");
                    return [2 /*return*/];
                }
                tagIds = Array.isArray(req.body.tag_ids)
                    ? req.body.tag_ids
                        .map(function (id) { return Number(id); })
                        .filter(function (id) { return !Number.isNaN(id); })
                    : undefined;
                articleData = {};
                if (typeof req.body.title === "string") {
                    articleData.title = req.body.title.trim();
                }
                if (typeof req.body.slug === "string") {
                    trimmedSlug = req.body.slug.trim();
                    if (trimmedSlug) {
                        sanitized = (0, slug_1.buildSlug)(trimmedSlug);
                        if (!sanitized) {
                            (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                            return [2 /*return*/];
                        }
                        articleData.slug = sanitized;
                    }
                }
                if (typeof req.body.content === "string") {
                    articleData.content = req.body.content;
                }
                explicitExcerptNonEmpty = req.body.excerpt != null &&
                    req.body.excerpt !== "" &&
                    String(req.body.excerpt).trim() !== "";
                if (explicitExcerptNonEmpty) {
                    articleData.excerpt = String(req.body.excerpt).trim();
                }
                else if (typeof req.body.content === "string") {
                    articleData.excerpt = (0, excerpt_1.excerptFromPlainText)(req.body.content);
                }
                rawStatusEdit = req.body.status;
                if (typeof rawStatusEdit === "string" &&
                    VALID_STATUSES.includes(rawStatusEdit)) {
                    articleData.status = rawStatusEdit;
                }
                if (req.body.featured_image_id !== undefined) {
                    rawFeaturedEdit = req.body.featured_image_id;
                    articleData.featured_image_id =
                        rawFeaturedEdit != null && rawFeaturedEdit !== ""
                            ? Number(rawFeaturedEdit) || null
                            : null;
                }
                if (req.body.published_at !== undefined) {
                    articleData.published_at =
                        req.body.published_at != null && req.body.published_at !== ""
                            ? String(req.body.published_at)
                            : null;
                }
                articleData.tag_ids = tagIds;
                mergedStatus = (_a = articleData.status) !== null && _a !== void 0 ? _a : existingArticle.status;
                mergedPublishedAt = "published_at" in articleData
                    ? articleData.published_at
                    : existingArticle.published_at;
                if (mergedStatus === "published" &&
                    (mergedPublishedAt == null || mergedPublishedAt === "")) {
                    articleData.published_at = new Date().toISOString();
                }
                return [4 /*yield*/, articlesAdminModel_1.default.update(articleId, articleData)];
            case 2:
                updatedArticle = _b.sent();
                if (!updatedArticle) {
                    (0, httpErrors_1.sendError)(res, 404, "Article non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(updatedArticle);
                return [3 /*break*/, 4];
            case 3:
                err_5 = _b.sent();
                logger_1.default.error("Erreur lors de la mise à jour de l'article (admin) :", err_5);
                if (err_5 instanceof Error && err_5.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Un article avec ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour de l'article");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.edit = edit;
// Supprime un article par ID.
// DELETE /admin/articles/:id
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var articleId, deleted, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                articleId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(articleId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, articlesAdminModel_1.default.deleteOne(articleId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    (0, httpErrors_1.sendError)(res, 404, "Article non trouvé");
                    return [2 /*return*/];
                }
                res.sendStatus(204);
                return [3 /*break*/, 3];
            case 2:
                err_6 = _a.sent();
                logger_1.default.error("Erreur lors de la suppression de l'article (admin) :", err_6);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la suppression de l'article");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.destroy = destroy;
