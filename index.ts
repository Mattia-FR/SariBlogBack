import dotenv from "dotenv";

dotenv.config();

import logger from "./src/utils/logger";
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

app.listen(port, () => {
	logger.info(`Server adress : http://localhost:${port}`);
});
