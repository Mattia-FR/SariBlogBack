const db = require("./db");

const findAbout = async () => {
	const [rows] = await db.query(
		"SELECT id, content, image, updated_at FROM about LIMIT 1",
	);
	return rows[0] || null;
};

module.exports = { findAbout };
