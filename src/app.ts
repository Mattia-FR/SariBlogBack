import path from "node:path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Request } from "express";
import morgan from "morgan";
import { helmetMiddleware } from "./config/helmet";
import { errorHandler } from "./middleware/errorMiddleware";
import { requestId } from "./middleware/requestIdMiddleware";
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

// Corrélation des logs (avant Morgan pour que l'access log porte l'ID)
app.use(requestId);

morgan.token("request-id", (req) => (req as Request).requestId ?? "-");

// Logging
app.use(
	morgan(
		process.env.NODE_ENV === "production"
			? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" rid=:request-id'
			: ":method :url :status :response-time ms rid=:request-id",
		{ stream: morganStream },
	),
);

// Fichiers statiques
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API
app.use("/api", router);

// Middleware d'erreur
app.use(errorHandler);

export default app;
