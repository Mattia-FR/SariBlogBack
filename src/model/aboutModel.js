const db = require("./db");

// ✅ Récupérer le contenu "À propos"
const findAbout = async () => {
	// On récupère le contenu, l'image et la date de mise à jour
	// LIMIT 1 car il n'y a qu'une seule entrée "À propos"
	const query = "SELECT id, content, image, updated_at FROM about LIMIT 1";

	const [rows] = await db.execute(query);
	return rows[0] || null;
};

module.exports = { findAbout };
