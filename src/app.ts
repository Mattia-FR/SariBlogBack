import express from "express";
import cors from "cors";
import path from "node:path";
import { helmetMiddleware } from "./config/helmet";
import router from "./router";

const app = express();

// 1️⃣ Sécurité HTTP (headers navigateur)
app.use(helmetMiddleware);

// 2️⃣ CORS (contrôle des requêtes cross-origin)
app.use(cors());

// 3️⃣ Parsing JSON
app.use(express.json());

// 4️⃣ Logging (dev)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 5️⃣ Fichiers statiques
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 6️⃣ API
app.use("/api", router);

export default app;
