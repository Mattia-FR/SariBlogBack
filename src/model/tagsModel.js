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
var logger_1 = __importDefault(require("../utils/logger"));
var db_1 = __importDefault(require("./db"));
/* J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
Le frontend reçoit toujours des objets strictement conformes à l'interface Tag.
Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet. */
// Convertit une row en Tag (id, name, slug uniquement).
// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
function rowToTag(row) {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
    };
}
var findByArticleId = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT t.id, t.name, t.slug\n\t\t\tFROM tags t\n\t\t\tINNER JOIN articles_tags at ON t.id = at.tag_id\n\t\t\tWHERE at.article_id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) { return rowToTag(row); })];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByImageId = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT t.id, t.name, t.slug\n\t\t\tFROM tags t\n\t\t\tINNER JOIN images_tags it ON t.id = it.tag_id\n\t\t\tWHERE it.image_id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) { return rowToTag(row); })];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
// Tags liés à au moins un article au statut published (pour filtres blog public).
var findUsedOnPublishedArticles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT DISTINCT t.id, t.name, t.slug\n\t\t\tFROM tags t\n\t\t\tINNER JOIN articles_tags at ON t.id = at.tag_id\n\t\t\tINNER JOIN articles a ON a.id = at.article_id\n\t\t\tWHERE a.status = 'published'\n\t\t\tORDER BY t.name")];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) { return rowToTag(row); })];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
// Tags liés à au moins une image en galerie dans une catégorie donnée.
var findUsedOnGalleryImagesByCategoryId = function (categoryId) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT DISTINCT t.id, t.name, t.slug\n\t\t\tFROM tags t\n\t\t\tINNER JOIN images_tags it ON t.id = it.tag_id\n\t\t\tINNER JOIN images i ON i.id = it.image_id\n\t\t\tWHERE i.category_id = ? AND i.is_in_gallery = TRUE\n\t\t\tORDER BY t.name", [categoryId])];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) { return rowToTag(row); })];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findByArticleId: findByArticleId,
    findByImageId: findByImageId,
    findUsedOnPublishedArticles: findUsedOnPublishedArticles,
    findUsedOnGalleryImagesByCategoryId: findUsedOnGalleryImagesByCategoryId,
};
