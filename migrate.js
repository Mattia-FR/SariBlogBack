// Load environment variables from .env file
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

// Build the path to the database SQL file
const schema = path.join(__dirname, "database.sql");

// Get database connection details from .env file
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
	console.error("❌ Missing required database environment variables");
	process.exit(1);
}

const migrate = async () => {
	try {
		console.log("🔄 Starting database migration...");

		// Read the SQL statements from the database.sql file
		const sql = fs.readFileSync(schema, "utf8");

		// Create a specific connection to the database
		const database = await mysql.createConnection({
			host: DB_HOST,
			port: DB_PORT || 3306,
			user: DB_USER,
			password: DB_PASSWORD,
			multipleStatements: true, // Allow multiple SQL statements
		});

		console.log("📡 Connected to MySQL server");

		// Drop the existing database if it exists
		console.log(`🗑️  Dropping database '${DB_NAME}' if it exists...`);
		await database.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);

		// Create a new database with the specified name
		console.log(`🆕 Creating database '${DB_NAME}'...`);
		await database.query(`CREATE DATABASE \`${DB_NAME}\``);

		// Switch to the newly created database
		console.log(`🔄 Switching to database '${DB_NAME}'...`);
		await database.query(`USE \`${DB_NAME}\``);

		// Execute the SQL statements to update the database schema
		console.log("⚙️ Executing schema and data...");
		await database.query(sql);

		// Close the database connection
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

// Run the migration function
migrate();
