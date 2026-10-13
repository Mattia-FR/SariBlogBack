import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { helmetMiddleware } from "./config/helmet";
import { errorHandler } from "./middleware/errorMiddleware";
import router from "./router";
import { morganStream } from "./utils/logger";

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
app.use(
	morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", {
		stream: morganStream,
	}),
);

// Fichiers statiques
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API
app.use("/api", router);

// Middleware d'erreur
app.use(errorHandler);

export default app;
