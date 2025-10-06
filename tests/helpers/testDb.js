const mysql = require("mysql2/promise");

// Configuration de la base de données de test
const testDbConfig = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "test_user",
	password: process.env.DB_PASSWORD || "test_password",
	database: process.env.DB_NAME || "sari_blog_test",
	multipleStatements: true,
};

let connection;

/**
 * Établit une connexion à la base de données de test
 */
const connect = async () => {
	try {
		connection = await mysql.createConnection(testDbConfig);
		console.log("✅ Connexion à la base de données de test établie");
		return connection;
	} catch (error) {
		console.error("❌ Erreur de connexion à la base de données de test:", error);
		throw error;
	}
};

/**
 * Ferme la connexion à la base de données de test
 */
const disconnect = async () => {
	if (connection) {
		await connection.end();
		connection = null;
		console.log("✅ Connexion à la base de données de test fermée");
	}
};

/**
 * Nettoie toutes les tables de test
 */
const cleanDatabase = async () => {
	if (!connection) {
		throw new Error("Aucune connexion à la base de données");
	}

	try {
		// Désactiver les contraintes de clés étrangères
		await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

		// Supprimer toutes les données des tables
		const tables = [
			"article_tags",
			"articles",
			"tags",
			"illustrations",
			"messages",
			"about",
			"users",
		];

		for (const table of tables) {
			await connection.execute(`DELETE FROM ${table}`);
			// Réinitialiser l'auto-increment
			await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
		}

		// Réactiver les contraintes de clés étrangères
		await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

		console.log("✅ Base de données de test nettoyée");
	} catch (error) {
		console.error("❌ Erreur lors du nettoyage de la base de données:", error);
		throw error;
	}
};

/**
 * Initialise la base de données de test avec des données de base
 */
const seedDatabase = async () => {
	if (!connection) {
		throw new Error("Aucune connexion à la base de données");
	}

	try {
		// Créer un utilisateur admin de test
		const argon2 = require("argon2");
		const adminPasswordHash = await argon2.hash("admin123");

		await connection.execute(
			`INSERT INTO users (username, email, password_hash, role, is_active) 
			 VALUES (?, ?, ?, ?, ?)`,
			["admin", "admin@test.com", adminPasswordHash, "admin", true],
		);

		// Créer un utilisateur editor de test
		const editorPasswordHash = await argon2.hash("editor123");
		await connection.execute(
			`INSERT INTO users (username, email, password_hash, role, is_active) 
			 VALUES (?, ?, ?, ?, ?)`,
			["editor", "editor@test.com", editorPasswordHash, "editor", true],
		);

		// Créer quelques tags de test
		await connection.execute(
			`INSERT INTO tags (name, description) VALUES 
			 ('Test Tag 1', 'Description du tag 1'),
			 ('Test Tag 2', 'Description du tag 2')`,
		);

		// Créer quelques articles de test
		await connection.execute(
			`INSERT INTO articles (title, slug, excerpt, content, image, status) VALUES 
			 ('Article Test 1', 'article-test-1', 'Extrait 1', 'Contenu 1', 'test1.jpg', 'published'),
			 ('Article Test 2', 'article-test-2', 'Extrait 2', 'Contenu 2', 'test2.jpg', 'draft')`,
		);

		console.log("✅ Base de données de test initialisée avec des données de test");
	} catch (error) {
		console.error("❌ Erreur lors de l'initialisation de la base de données:", error);
		throw error;
	}
};

/**
 * Exécute une requête SQL sur la base de données de test
 */
const execute = async (query, params = []) => {
	if (!connection) {
		throw new Error("Aucune connexion à la base de données");
	}

	try {
		const [rows] = await connection.execute(query, params);
		return [rows];
	} catch (error) {
		console.error("❌ Erreur lors de l'exécution de la requête:", error);
		throw error;
	}
};

module.exports = {
	connect,
	disconnect,
	cleanDatabase,
	seedDatabase,
	execute,
};
