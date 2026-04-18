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
var dateHelpers_1 = require("../../utils/dateHelpers");
var imageUrl_1 = require("../../utils/imageUrl");
var logger_1 = __importDefault(require("../../utils/logger"));
var slug_1 = require("../../utils/slug");
var db_1 = __importDefault(require("../db"));
// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.
/** Liste admin paginée (tous statuts), optionnellement filtrée par tag. */
var findAllForAdminPaginated = function (page, limit, tagId) { return __awaiter(void 0, void 0, void 0, function () {
    var offset, tagFilter, listParams, articles, countParams, countResult, tags_1, articleIds, placeholders, tagRows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                offset = (page - 1) * limit;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                tagFilter = tagId != null
                    ? "INNER JOIN articles_tags filt ON filt.article_id = a.id AND filt.tag_id = ?"
                    : "";
                listParams = tagId != null ? [tagId, limit, offset] : [limit, offset];
                return [4 /*yield*/, db_1.default.query("SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\t".concat(tagFilter, "\n\t\t\tORDER BY a.created_at DESC\n\t\t\tLIMIT ? OFFSET ?"), listParams)];
            case 2:
                articles = (_a.sent())[0];
                countParams = tagId != null ? [tagId] : [];
                return [4 /*yield*/, db_1.default.query(tagId != null
                        ? "SELECT COUNT(DISTINCT a.id) as total\n\t\t\t\tFROM articles a\n\t\t\t\tINNER JOIN articles_tags filt ON filt.article_id = a.id AND filt.tag_id = ?"
                        : "SELECT COUNT(*) as total FROM articles", countParams)];
            case 3:
                countResult = (_a.sent())[0];
                tags_1 = [];
                if (!(articles.length > 0)) return [3 /*break*/, 5];
                articleIds = articles.map(function (row) { return row.id; });
                placeholders = articleIds.map(function () { return "?"; }).join(",");
                return [4 /*yield*/, db_1.default.query("SELECT at.article_id, t.id, t.name, t.slug\n\t\t\t\tFROM articles_tags at\n\t\t\t\tLEFT JOIN tags t ON at.tag_id = t.id\n\t\t\t\tWHERE at.article_id IN (".concat(placeholders, ")"), articleIds)];
            case 4:
                tagRows = (_a.sent())[0];
                tags_1 = tagRows;
                _a.label = 5;
            case 5: return [2 /*return*/, {
                    // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                    articles: articles.map(function (article) {
                        var _a, _b, _c;
                        return ({
                            id: article.id,
                            title: article.title,
                            slug: article.slug,
                            excerpt: article.excerpt,
                            status: article.status,
                            user_id: article.user_id,
                            created_at: (_a = (0, dateHelpers_1.toDateString)(article.created_at)) !== null && _a !== void 0 ? _a : "",
                            updated_at: (_b = (0, dateHelpers_1.toDateString)(article.updated_at)) !== null && _b !== void 0 ? _b : "",
                            published_at: (_c = (0, dateHelpers_1.toDateString)(article.published_at)) !== null && _c !== void 0 ? _c : null,
                            views: article.views,
                            featured_image_id: article.featured_image_id,
                            imageUrl: (0, imageUrl_1.buildImageUrl)(article.image_path),
                            tags: tags_1
                                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                                .filter(function (t) { return t.article_id === article.id; })
                                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                                .map(function (t) { return ({ id: t.id, name: t.name, slug: t.slug }); }),
                        });
                    }),
                    total: countResult[0].total,
                }];
            case 6:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 7: return [2 /*return*/];
        }
    });
}); };
var findByIdForAdmin = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, tags, article, err_2;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("SELECT a.*, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\tWHERE a.id = ?", [id])];
            case 1:
                rows = (_d.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                return [4 /*yield*/, db_1.default.query("SELECT t.id, t.name, t.slug\n\t\t\tFROM articles_tags at\n\t\t\tLEFT JOIN tags t ON at.tag_id = t.id\n\t\t\tWHERE at.article_id = ?", [id])];
            case 2:
                tags = (_d.sent())[0];
                article = rows[0];
                return [2 /*return*/, {
                        id: article.id,
                        title: article.title,
                        slug: article.slug,
                        excerpt: article.excerpt,
                        content: article.content,
                        status: article.status,
                        user_id: article.user_id,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(article.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(article.updated_at)) !== null && _b !== void 0 ? _b : "",
                        published_at: (_c = (0, dateHelpers_1.toDateString)(article.published_at)) !== null && _c !== void 0 ? _c : null,
                        views: article.views,
                        featured_image_id: article.featured_image_id,
                        imageUrl: (0, imageUrl_1.buildImageUrl)(article.image_path),
                        tags: tags,
                    }];
            case 3:
                err_2 = _d.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 4: return [2 /*return*/];
        }
    });
}); };
var findBySlugForAdmin = function (slug) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, tags, article, err_3;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("SELECT a.*, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\tWHERE a.slug = ?", [slug])];
            case 1:
                rows = (_d.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                return [4 /*yield*/, db_1.default.query("SELECT t.id, t.name, t.slug\n\t\t\tFROM articles_tags at\n\t\t\tLEFT JOIN tags t ON at.tag_id = t.id\n\t\t\tWHERE at.article_id = ?", [rows[0].id])];
            case 2:
                tags = (_d.sent())[0];
                article = rows[0];
                return [2 /*return*/, {
                        id: article.id,
                        title: article.title,
                        slug: article.slug,
                        excerpt: article.excerpt,
                        content: article.content,
                        status: article.status,
                        user_id: article.user_id,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(article.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(article.updated_at)) !== null && _b !== void 0 ? _b : "",
                        published_at: (_c = (0, dateHelpers_1.toDateString)(article.published_at)) !== null && _c !== void 0 ? _c : null,
                        views: article.views,
                        featured_image_id: article.featured_image_id,
                        imageUrl: (0, imageUrl_1.buildImageUrl)(article.image_path),
                        tags: tags,
                    }];
            case 3:
                err_3 = _d.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 4: return [2 /*return*/];
        }
    });
}); };
var create = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var slug, publishedAt, result, articleId_1, tagIds, values, created, err_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                slug = (_a = data.slug) !== null && _a !== void 0 ? _a : (0, slug_1.buildSlug)(data.title);
                publishedAt = data.published_at != null && data.published_at !== ""
                    ? data.published_at
                    : null;
                return [4 /*yield*/, db_1.default.query("INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                        data.title,
                        slug,
                        data.excerpt,
                        data.content,
                        data.status,
                        data.user_id,
                        data.featured_image_id,
                        publishedAt,
                    ])];
            case 1:
                result = (_b.sent())[0];
                articleId_1 = result.insertId;
                tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
                if (!(tagIds.length > 0)) return [3 /*break*/, 3];
                values = tagIds.map(function (tagId) { return [articleId_1, tagId]; });
                return [4 /*yield*/, db_1.default.query("INSERT INTO articles_tags (article_id, tag_id) VALUES ?", [values])];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3: return [4 /*yield*/, findByIdForAdmin(articleId_1)];
            case 4:
                created = _b.sent();
                if (!created) {
                    throw new Error("Article introuvable après insertion");
                }
                return [2 /*return*/, created];
            case 5:
                err_4 = _b.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 6: return [2 /*return*/];
        }
    });
}); };
var update = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var allowedFields, updates, values, _i, allowedFields_1, field, hasTagIds, query, result, tagIds, tagValues, updatedArticle, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                allowedFields = [
                    "title",
                    "slug",
                    "excerpt",
                    "content",
                    "status",
                    "featured_image_id",
                    "published_at",
                ];
                updates = [];
                values = [];
                for (_i = 0, allowedFields_1 = allowedFields; _i < allowedFields_1.length; _i++) {
                    field = allowedFields_1[_i];
                    if (field in data) {
                        updates.push("".concat(field, " = ?"));
                        values.push(data[field]);
                    }
                }
                hasTagIds = "tag_ids" in data;
                if (!(updates.length > 0)) return [3 /*break*/, 2];
                values.push(id);
                query = "UPDATE articles SET ".concat(updates.join(", "), " WHERE id = ?");
                return [4 /*yield*/, db_1.default.query(query, values)];
            case 1:
                result = (_a.sent())[0];
                if (result.affectedRows === 0) {
                    return [2 /*return*/, null];
                }
                _a.label = 2;
            case 2:
                if (!hasTagIds) return [3 /*break*/, 5];
                tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
                return [4 /*yield*/, db_1.default.query("DELETE FROM articles_tags WHERE article_id = ?", [id])];
            case 3:
                _a.sent();
                if (!(tagIds.length > 0)) return [3 /*break*/, 5];
                tagValues = tagIds.map(function (tagId) { return [id, tagId]; });
                return [4 /*yield*/, db_1.default.query("INSERT INTO articles_tags (article_id, tag_id) VALUES ?", [tagValues])];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [4 /*yield*/, findByIdForAdmin(id)];
            case 6:
                updatedArticle = _a.sent();
                return [2 /*return*/, updatedArticle];
            case 7:
                err_5 = _a.sent();
                logger_1.default.error(err_5);
                throw err_5;
            case 8: return [2 /*return*/];
        }
    });
}); };
var deleteOne = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("DELETE FROM articles WHERE id = ?", [id])];
            case 1:
                result = (_a.sent())[0];
                return [2 /*return*/, result.affectedRows > 0];
            case 2:
                err_6 = _a.sent();
                logger_1.default.error(err_6);
                throw err_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
var countAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT COUNT(*) as total FROM articles")];
            case 1:
                rows = (_a.sent())[0];
                return [2 /*return*/, rows[0].total];
            case 2:
                err_7 = _a.sent();
                logger_1.default.error(err_7);
                throw err_7;
            case 3: return [2 /*return*/];
        }
    });
}); };
var countByStatus = function (status) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT COUNT(*) as total FROM articles WHERE status = ?", [status])];
            case 1:
                rows = (_a.sent())[0];
                return [2 /*return*/, rows[0].total];
            case 2:
                err_8 = _a.sent();
                logger_1.default.error(err_8);
                throw err_8;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findAllForAdminPaginated: findAllForAdminPaginated,
    findByIdForAdmin: findByIdForAdmin,
    findBySlugForAdmin: findBySlugForAdmin,
    create: create,
    update: update,
    deleteOne: deleteOne,
    countAll: countAll,
    countByStatus: countByStatus,
};
