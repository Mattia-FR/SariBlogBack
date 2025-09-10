const express = require("express");
const cors = require("cors");
const path = require("node:path");
const morgan = require("morgan");

const router = require("./router");
const {
	helmetConfig,
	generalRateLimit,
	compression,
} = require("./middleware/security");
const { standardResponse, cacheHeaders } = require("./middleware/response");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// ✅ Appliquer les middleware de sécurité
app.use(helmetConfig);
app.use(compression);
app.use(generalRateLimit);

// ✅ CORS configuré
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
	}),
);

// ✅ Logging
app.use(morgan("combined"));

// ✅ Parsing
app.use(express.json({ limit: "10mb" }));

// ✅ Middleware de réponse standardisée
app.use(standardResponse);
app.use(cacheHeaders);

// ✅ Images statiques
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// ✅ Route de santé
app.get("/", (req, res) => {
	res.success({
		message: "SariBlog API is running",
		version: "1.0.0",
		timestamp: new Date().toISOString(),
	});
});

// ✅ API routes
app.use("/api", router);

// ✅ Gestion des erreurs
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
