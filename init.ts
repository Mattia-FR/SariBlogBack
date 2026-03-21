import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import logger from "./src/utils/logger";
import { runSeeds } from "./seeds";

dotenv.config();

// ============================================
// Variables d'environnement requises dans .env :
//   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
// ============================================

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	logger.error(
		"❌ Variables d'environnement manquantes (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)",
	);
	process.exit(1);
}

async function initDatabase(): Promise<void> {
	// Connexion sans sélectionner de base (pour pouvoir la supprimer/créer)
	const connection = await mysql.createConnection({
		host: DB_HOST,
		port: DB_PORT ? Number.parseInt(DB_PORT) : 3306,
		user: DB_USER,
		password: DB_PASSWORD,
		multipleStatements: true, // nécessaire pour exécuter le schéma SQL en une passe
	});

	try {
		// ── Étape 1 : suppression et création de la base ─────────────────────────
		logger.info(`🗑️  Suppression de la base "${DB_NAME}" si elle existe...`);
		await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

		logger.info(`🛠️  Création de la base "${DB_NAME}"...`);
		await connection.query(
			`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
		);

		await connection.query(`USE \`${DB_NAME}\``);

		// ── Étape 2 : création des tables ────────────────────────────────────────
		logger.info("📐 Création des tables...");
		const schemaPath = path.join(__dirname, "schema.sql");
		const schema = fs.readFileSync(schemaPath, "utf8");
		await connection.query(schema);

		// ── Étape 3 : insertion des données de test ──────────────────────────────
		logger.info("🌱 Insertion des données de test...");
		await runSeeds(connection);

		logger.info(`\n✅ Base de données "${DB_NAME}" initialisée avec succès !`);
	} catch (error) {
		logger.error("❌ Erreur lors de l'initialisation :", error);
		process.exit(1);
	} finally {
		await connection.end();
	}
}

initDatabase();
