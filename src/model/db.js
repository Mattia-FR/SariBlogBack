const mysql = require("mysql2/promise");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	console.error("❌ Missing required database environment variables");
	process.exit(1);
}

// Configuration du pool de connexions
const pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	port: DB_PORT || 3306,
	charset: "utf8mb4",
	acquireTimeout: 60000,
	timeout: 60000,
	reconnect: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// Test de connexion au démarrage
const testConnection = async () => {
	try {
		const connection = await pool.getConnection();
		console.log("✅ Database connected successfully");
		connection.release();
	} catch (err) {
		console.error("❌ Database connection failed:", err.message);
		process.exit(1);
	}
};

// Tester la connexion
testConnection();

module.exports = pool;
