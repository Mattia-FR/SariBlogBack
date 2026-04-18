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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dateHelpers_1 = require("../utils/dateHelpers");
var imageUrl_1 = require("../utils/imageUrl");
var logger_1 = __importDefault(require("../utils/logger"));
var db_1 = __importDefault(require("./db"));
// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, imageUrl, tags), le frontend reçoit toujours des objets strictement conformes à l’interface Article.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.
var findPublished = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (page, limit, tagId) {
        var offset, tagFilter, listParams, articles, countParams, countResult, tags_1, articleIds, placeholders, tagRows, err_1;
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 10; }
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
                    return [4 /*yield*/, db_1.default.query("SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path\n      FROM articles a\n      LEFT JOIN images i ON a.featured_image_id = i.id\n      ".concat(tagFilter, "\n      WHERE a.status = 'published'\n      ORDER BY a.published_at DESC\n      LIMIT ? OFFSET ?"), listParams)];
                case 2:
                    articles = (_a.sent())[0];
                    countParams = tagId != null ? [tagId] : [];
                    return [4 /*yield*/, db_1.default.query(tagId != null
                            ? "SELECT COUNT(DISTINCT a.id) as total\n          FROM articles a\n          INNER JOIN articles_tags filt ON filt.article_id = a.id AND filt.tag_id = ?\n          WHERE a.status = 'published'"
                            : "SELECT COUNT(*) as total FROM articles WHERE status = 'published'", countParams)];
                case 3:
                    countResult = (_a.sent())[0];
                    tags_1 = [];
                    if (!(articles.length > 0)) return [3 /*break*/, 5];
                    articleIds = articles.map(function (row) { return row.id; });
                    placeholders = articleIds.map(function () { return "?"; }).join(",");
                    return [4 /*yield*/, db_1.default.query("SELECT at.article_id, t.id, t.name, t.slug\n        FROM articles_tags at\n        LEFT JOIN tags t ON at.tag_id = t.id\n        WHERE at.article_id IN (".concat(placeholders, ")"), articleIds)];
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
    });
};
var findPublishedById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, tags, article, err_2;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("SELECT a.*, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\tWHERE a.status = 'published' AND a.id = ?", [id])];
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
var findPublishedBySlug = function (slug) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, tags, article, err_3;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("SELECT a.*, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\tWHERE a.status = 'published' AND a.slug = ?", [slug])];
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
var findHomepagePreview = function () { return __awaiter(void 0, void 0, void 0, function () {
    var articles, tags_2, articleIds, placeholders, tagRows, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, db_1.default.query("SELECT a.id, a.title, a.slug, a.excerpt, a.status, a.user_id, a.created_at, a.updated_at, a.published_at, a.views, a.featured_image_id, i.path as image_path\n\t\t\tFROM articles a\n\t\t\tLEFT JOIN images i ON a.featured_image_id = i.id\n\t\t\tWHERE a.status = 'published'\n\t\t\tORDER BY a.published_at DESC\n\t\t\tLIMIT 4")];
            case 1:
                articles = (_a.sent())[0];
                tags_2 = [];
                if (!(articles.length > 0)) return [3 /*break*/, 3];
                articleIds = articles.map(function (row) { return row.id; });
                placeholders = articleIds.map(function () { return "?"; }).join(",");
                return [4 /*yield*/, db_1.default.query("SELECT at.article_id, t.id, t.name, t.slug\n        FROM articles_tags at\n        LEFT JOIN tags t ON at.tag_id = t.id\n        WHERE at.article_id IN (".concat(placeholders, ")"), articleIds)];
            case 2:
                tagRows = (_a.sent())[0];
                tags_2 = tagRows;
                _a.label = 3;
            case 3: 
            // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
            return [2 /*return*/, articles.map(function (article) {
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
                        tags: tags_2
                            // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                            .filter(function (t) { return t.article_id === article.id; })
                            // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                            .map(function (t) { return ({ id: t.id, name: t.name, slug: t.slug }); }),
                    });
                })];
            case 4:
                err_4 = _a.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findPublished: findPublished,
    findPublishedById: findPublishedById,
    findPublishedBySlug: findPublishedBySlug,
    findHomepagePreview: findHomepagePreview,
};
