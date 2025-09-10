require("dotenv").config();
const app = require("./src/app");

const port = process.env.PORT || 3000;

// Validation des variables d'environnement critiques
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
	console.error("❌ Missing required environment variables:");
	for (const varName of missingVars) {
		console.error(`   - ${varName}`);
	}
	process.exit(1);
}

// Démarrage du serveur
app.listen(port, (err) => {
	if (err) {
		console.error("❌ Server failed to start:", err.message);
		process.exit(1);
	} else {
		console.log(`✅ Server running on http://localhost:${port}`);
		console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
	}
});

// Gestion des signaux de fermeture
process.on("SIGTERM", () => {
	console.log("🔄 SIGTERM received, shutting down gracefully");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("🔄 SIGINT received, shutting down gracefully");
	process.exit(0);
});
