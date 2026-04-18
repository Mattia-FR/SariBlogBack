"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var logger_1 = __importDefault(require("./src/utils/logger"));
var app_1 = __importDefault(require("./src/app"));
var port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4242;
app_1.default.get("/", function (req, res) {
    res.status(200).send("Je suis sur l'API 'http://localhost:4242'");
});
app_1.default.listen(port, function () {
    logger_1.default.info("Server adress : http://localhost:".concat(port));
});
