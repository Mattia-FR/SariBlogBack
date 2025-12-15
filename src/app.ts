import express from "express";
import cors from "cors";
import path from "node:path";
import router from "./router";

const app = express();

app.use(cors());
app.use(express.json());

// Middleware de logging basique (utile en dev)
// TODO: Remplacer par Morgan/Winston plus tard
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

// Servir les fichiers statiques du dossier uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", router);
export default app;
