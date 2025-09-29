const db = require("./db");

// ✅ Garde ta fonction actuelle - elle est parfaite !
const findLatestPublished = async (limit = 4) => {
	// On récupère l'id, le titre, le slug (URL-friendly), l'extrait, l'image, la date de création
	// On utilise le format ISO pour les dates
	// GROUP_CONCAT permet de combiner tous les tags d'un article en une seule chaîne
	// On récupère même les articles sans tag avec LEFT JOIN
	// 1ère jointure : articles → article_tags (table de liaison)
	// 2ème jointure : article_tags → tags (récupérer les noms)
	// GROUP BY permet d'avoir une ligne par article et non une ligne par tag
	const query = `
		SELECT 
			a.id, 
			a.title, 
			a.slug, 
			a.excerpt, 
			a.image, 
			a.created_at,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM articles a
		LEFT JOIN article_tags at ON a.id = at.article_id
		LEFT JOIN tags t ON at.tag_id = t.id
		WHERE a.status = 'published'
		GROUP BY a.id
		ORDER BY a.created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 4}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Nouvelle fonction simple pour la page blog
const findAllPublished = async (limit, offset) => {
	const query = `
		SELECT 
			a.id, 
			a.title, 
			a.slug, 
			a.excerpt, 
			a.image, 
			a.created_at,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM articles a
		LEFT JOIN article_tags at ON a.id = at.article_id
		LEFT JOIN tags t ON at.tag_id = t.id
		WHERE a.status = 'published'
		GROUP BY a.id
		ORDER BY a.created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Compter le total pour la pagination
const countPublished = async () => {
	const query = `SELECT COUNT(*) as total FROM articles WHERE status = 'published'`;
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer un article par slug
const findBySlug = async (slug) => {
	const query = `
		SELECT 
			a.id, 
			a.title, 
			a.slug, 
			a.excerpt, 
			a.content,
			a.image, 
			a.created_at,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM articles a
		LEFT JOIN article_tags at ON a.id = at.article_id
		LEFT JOIN tags t ON at.tag_id = t.id
		WHERE a.slug = ? AND a.status = 'published'
		GROUP BY a.id
	`;

	const [rows] = await db.execute(query, [slug]);
	return rows[0] || null;
};

module.exports = {
	findLatestPublished,
	findAllPublished,
	countPublished,
	findBySlug,
};
