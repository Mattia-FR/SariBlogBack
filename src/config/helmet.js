"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helmetMiddleware = void 0;
var helmet_1 = __importDefault(require("helmet"));
exports.helmetMiddleware = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'", "http://localhost:4242"],
            frameAncestors: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: {
        action: "sameorigin",
    },
    referrerPolicy: {
        policy: "no-referrer",
    },
});
