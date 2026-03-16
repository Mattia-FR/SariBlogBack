import express from "express";
import cors from "cors";
import path from "node:path";
import cookieParser from "cookie-parser";
import { helmetMiddleware } from "./config/helmet";
import router from "./router";
import { errorHandler } from "./middleware/errorMiddleware";

const app = express();

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
	console.log(`${req.method} ${req.url}`);
	next();
});

// Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API
app.use("/api", router);

// Middleware d'erreur
app.use(errorHandler);

export default app;
