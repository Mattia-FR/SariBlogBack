"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
var node_crypto_1 = __importDefault(require("node:crypto"));
var node_path_1 = __importDefault(require("node:path"));
var multer_1 = __importDefault(require("multer"));
var uploadDir = "./uploads/images";
var storage = multer_1.default.diskStorage({
    destination: function (_req, _file, callbackMulter) {
        callbackMulter(null, uploadDir);
    },
    filename: function (_req, file, callbackMulter) {
        var id = node_crypto_1.default.randomUUID();
        var ext = node_path_1.default.extname(file.originalname);
        callbackMulter(null, "".concat(id).concat(ext));
    },
});
exports.uploadImage = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: function (_req, file, callbackMulter) {
        if (file.mimetype.startsWith("image/")) {
            callbackMulter(null, true);
        }
        else {
            // On rejette proprement pour éviter de tomber sur un 500.
            // `add()` gère déjà le cas `!req.file` et renvoie un 400.
            callbackMulter(null, false);
        }
    },
});
