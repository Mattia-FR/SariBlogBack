import mysql, { type Pool, type PoolConnection } from "mysql2/promise";

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Validation des variables d'environnement (fail fast)
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	throw new Error("Variables d'environnement de base de données manquantes");
}

const pool: Pool = mysql.createPool({
	host: DB_HOST,
	user: DB_USER,
	password: DB_PASSWORD,
	database: DB_NAME,
	port: DB_PORT ? Number.parseInt(DB_PORT, 10) : 3306,
});

/**
 * Exécute `fn` dans une transaction : commit si tout passe, rollback puis relance sinon.
 * La connexion est toujours rendue au pool.
 */
export async function withTransaction<T>(
	fn: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
	const connection = await pool.getConnection();
	try {
		await connection.beginTransaction();
		const result = await fn(connection);
		await connection.commit();
		return result;
	} catch (err) {
		await connection.rollback();
		throw err;
	} finally {
		connection.release();
	}
}

export default pool;
