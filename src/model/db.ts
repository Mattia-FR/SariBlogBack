import mysql, { type Pool } from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	throw new Error("Missing required database environment variables");
}

const pool: Pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	port: DB_PORT ? Number.parseInt(DB_PORT, 10) : 3306,
});

export default pool;
