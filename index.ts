import dotenv from "dotenv";

dotenv.config();

import logger from "./src/utils/logger";
import pool from "./src/model/db";
import app from "./src/app";

if (!process.env.ALLOWED_ORIGIN?.trim()) {
	logger.warn(
		"ALLOWED_ORIGIN est absent ou vide : le CORS peut ne pas convenir au front en requêtes cross-origin. Définis cette variable dans .env avant un déploiement.",
	);
}

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4242;

app.get("/", (req, res) => {
	res.status(200).send("Je suis sur l'API 'http://localhost:4242'");
});

const server = app.listen(port, () => {
	logger.info(`Server adress : http://localhost:${port}`);
});

let shuttingDown = false;

// Arrêt gracieux : on cesse d'accepter des connexions, on ferme le pool MySQL, puis on sort.
// exitCode 0 pour un arrêt demandé (SIGTERM/SIGINT), 1 après un crash.
function shutdown(exitCode: number) {
	if (shuttingDown) return;
	shuttingDown = true;

	server.close(async () => {
		try {
			await pool.end();
		} catch (err) {
			logger.error("Erreur lors de la fermeture du pool MySQL :", err);
		}
		process.exit(exitCode);
	});

	setTimeout(() => process.exit(exitCode), 5000).unref();
}

process.on("unhandledRejection", (reason) => {
	logger.error("Unhandled rejection:", reason);
	shutdown(1);
});

process.on("uncaughtException", (err) => {
	logger.error("Uncaught exception:", err);
	shutdown(1);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
	process.on(signal, () => {
		logger.info(`${signal} reçu, arrêt du serveur`);
		shutdown(0);
	});
}
