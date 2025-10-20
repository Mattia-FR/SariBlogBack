const db = require("./db");

// ✅ Récupérer le contenu "À propos" (admin)
const findAbout = async () => {
	const query = `
		SELECT 
			id, 
			content, 
			image, 
			updated_at
		FROM about 
		LIMIT 1
	`;

	const [rows] = await db.execute(query);
	return rows[0] || null;
};

// ✅ Modifier le contenu "À propos"
const update = async ({ content, image }) => {
	// Vérifier s'il existe déjà une entrée
	const existing = await findAbout();

	if (existing) {
		// Mettre à jour l'entrée existante
		const query = `
			UPDATE about 
			SET content = COALESCE(?, content),
				image = COALESCE(?, image),
				updated_at = NOW()
			WHERE id = ?
		`;

		await db.execute(query, [content, image, existing.id]);

		return await findAbout();
	}
	// Créer une nouvelle entrée
	const query = `
			INSERT INTO about (content, image)
			VALUES (?, ?)
		`;

	const [result] = await db.execute(query, [content, image]);

	return {
		id: result.insertId,
		content,
		image,
		updated_at: new Date().toISOString(),
	};
};

// ✅ Mettre à jour seulement le contenu
const updateContent = async (content) => {
	const existing = await findAbout();

	if (!existing) {
		throw new Error("Aucun contenu 'À propos' trouvé");
	}

	const query = `
		UPDATE about 
		SET content = ?, updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [content, existing.id]);

	return await findAbout();
};

// ✅ Mettre à jour seulement l'image
const updateImage = async (image) => {
	const existing = await findAbout();

	if (!existing) {
		throw new Error("Aucun contenu 'À propos' trouvé");
	}

	const query = `
		UPDATE about 
		SET image = ?, updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [image, existing.id]);

	return await findAbout();
};

// ✅ Obtenir l'historique des modifications (optionnel)
const getHistory = async () => {
	// Pour l'instant, on retourne juste les infos actuelles
	// Plus tard, on pourrait ajouter une table d'historique
	const about = await findAbout();

	return {
		current: about,
		lastModified: about?.updated_at || null,
	};
};

module.exports = {
	findAbout,
	update,
	updateContent,
	updateImage,
	getHistory,
};
