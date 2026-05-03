const mysql = require("mysql2/promise");

(async () => {
	const conn = await mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		port: process.env.DB_PORT || 3306,
	});
	const [rows] = await conn.query(
		"SELECT id, title, featured_image_id FROM articles WHERE slug = ?",
		["retouche-finale-quand-sarreter"],
	);
	console.log(rows);
	await conn.end();
})();
