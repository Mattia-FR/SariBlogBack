import express from "express";
import cors from "cors";
import path from "node:path";
import cookieParser from "cookie-parser";
import { helmetMiddleware } from "./config/helmet";
import router from "./router";

const app = express();

// 1️⃣ Sécurité HTTP
app.use(helmetMiddleware);

// 2️⃣ CORS
app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true, // 🔑 OBLIGATOIRE pour cookies
	}),
);

// 3️⃣ Parsing JSON
app.use(express.json());

// 🔑 Parsing cookies
app.use(cookieParser());

// 4️⃣ Logging
app.use((req, _res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

// 5️⃣ Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 6️⃣ API
app.use("/api", router);

export default app;
