const express = require("express");
const cors = require("cors");
const path = require("node:path");
const morgan = require("morgan");

const router = require("./router");
const {
	helmetConfig,
	globalSafetyRateLimit, // Rate limit global de sécurité
	compression,
} = require("./middleware/security");
const { standardResponse, cacheHeaders } = require("./middleware/response");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

// ✅ Appliquer les middleware de sécurité
app.use(helmetConfig);
app.use(compression);

// ✅ Rate limit global de sécurité (très permissif, juste pour éviter les abus extrêmes)
app.use(globalSafetyRateLimit);

// ✅ CORS configuré
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
	}),
);

// ✅ Middleware de logging
app.use(morgan("combined"));

// ✅ Middleware de parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Middleware de réponse standardisée
app.use(standardResponse);

// ✅ Images statiques avec CORS explicite
app.use(
	"/images",
	(req, res, next) => {
		// Permettre l'accès cross-origin pour les images
		res.header(
			"Access-Control-Allow-Origin",
			process.env.FRONTEND_URL || "http://localhost:5173",
		);
		res.header("Access-Control-Allow-Methods", "GET");
		res.header(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept",
		);
		res.header("Cross-Origin-Resource-Policy", "cross-origin");
		next();
	},
	express.static(path.join(__dirname, "../public/images")),
);

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
