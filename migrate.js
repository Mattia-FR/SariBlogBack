// Charger les variables d'environnement depuis le fichier .env
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

// Construire le chemin vers le fichier SQL de la base de données
const schema = path.join(__dirname, "database.sql");

// Récupérer les détails de connexion à la base de données depuis le fichier .env
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	console.error("❌ Missing required database environment variables");
	process.exit(1);
}

const migrate = async () => {
	try {
		console.log("🔄 Starting database migration...");

		// Lire les instructions SQL depuis le fichier database.sql
		const sql = fs.readFileSync(schema, "utf8");

		// Créer une connexion spécifique à la base de données
		const database = await mysql.createConnection({
			host: DB_HOST,
			port: DB_PORT || 3306,
			user: DB_USER,
			password: DB_PASSWORD,
			multipleStatements: true, // Permettre plusieurs instructions SQL
		});

		console.log("📡 Connected to MySQL server");

		// Supprimer la base de données existante si elle existe
		console.log(`🗑️  Dropping database '${DB_NAME}' if it exists...`);
		await database.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

		// Créer une nouvelle base de données avec le nom spécifié
		console.log(`🆕 Creating database '${DB_NAME}'...`);
		await database.query(`CREATE DATABASE \`${DB_NAME}\``);

		// Basculer vers la base de données nouvellement créée
		console.log(`🔄 Switching to database '${DB_NAME}'...`);
		await database.query(`USE \`${DB_NAME}\``);

		// Exécuter les instructions SQL pour mettre à jour le schéma de la base de données
		console.log("⚙️ Executing schema and data...");
		await database.query(sql);

		// Fermer la connexion à la base de données
		await database.end();

		console.log(
			`✅ Database '${DB_NAME}' successfully migrated from '${path.normalize(schema)}' 🆙`,
		);
	} catch (err) {
		console.error("❌ Error updating the database:", err.message);
		if (err.stack) {
			console.error("Stack trace:", err.stack);
		}
		process.exit(1);
	}
};

// Exécuter la fonction de migration
migrate();
