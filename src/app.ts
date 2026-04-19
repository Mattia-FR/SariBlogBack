import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { helmetMiddleware } from "./config/helmet";
import { errorHandler } from "./middleware/errorMiddleware";
import router from "./router";
import logger from "./utils/logger";

const app = express();

// Fichiers statiques
app.use(
	"/uploads",
	express.static(path.join(__dirname, "uploads"), {
		setHeaders: (res) => {
			res.setHeader("Access-Control-Allow-Origin", "*");
		},
	}),
);

// Sécurité HTTP
app.use(helmetMiddleware);

// CORS
app.use(
	cors({
		origin: process.env.ALLOWED_ORIGIN,
		credentials: true, // OBLIGATOIRE pour cookies
	}),
);

// Parsing JSON
app.use(express.json());

// Parsing cookies
app.use(cookieParser());

// Logging
app.use((req, _res, next) => {
	logger.info(`${req.method} ${req.url}`);
	next();
});

// API
app.use("/api", router);

// Middleware d'erreur
app.use(errorHandler);

export default app;
