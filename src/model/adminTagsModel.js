const db = require("./db");
const slugify = require("slugify");

// ✅ Lister tous les tags avec pagination
const findAll = async (limit, offset) => {
	const query = `
		SELECT 
			t.id,
			t.name,
			t.slug,
			COUNT(DISTINCT at.article_id) as articles_count,
			COUNT(DISTINCT it.illustration_id) as illustrations_count,
			DATE_FORMAT(t.created_at, '%d/%m/%Y') as created_at
		FROM tags t
		LEFT JOIN article_tags at ON t.id = at.tag_id
		LEFT JOIN illustration_tags it ON t.id = it.tag_id
		GROUP BY t.id
		ORDER BY t.name ASC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Compter le total de tags
const countAll = async () => {
	const query = `SELECT COUNT(*) as total FROM tags`;
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer un tag par ID
const findById = async (id) => {
	const query = `
		SELECT 
			t.id,
			t.name,
			t.slug,
			COUNT(DISTINCT at.article_id) as articles_count,
			COUNT(DISTINCT it.illustration_id) as illustrations_count
		FROM tags t
		LEFT JOIN article_tags at ON t.id = at.tag_id
		LEFT JOIN illustration_tags it ON t.id = it.tag_id
		WHERE t.id = ?
		GROUP BY t.id
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Récupérer un tag par slug
const findBySlug = async (slug) => {
	const query = `SELECT id, name, slug FROM tags WHERE slug = ?`;
	const [rows] = await db.execute(query, [slug]);
	return rows[0] || null;
};

// ✅ Créer un nouveau tag
const create = async ({ name }) => {
	const slug = slugify(name, { lower: true, strict: true });
	
	// Vérifier que le slug est unique
	const existingSlug = await findBySlug(slug);
	if (existingSlug) {
		throw new Error("Un tag avec ce nom existe déjà");
	}

	const query = `
		INSERT INTO tags (name, slug)
		VALUES (?, ?)
	`;

	const [result] = await db.execute(query, [name, slug]);
	
	return {
		id: result.insertId,
		name,
		slug,
		created_at: new Date().toISOString()
	};
};

// ✅ Modifier un tag
const update = async (id, { name }) => {
	// Récupérer le tag existant
	const existingTag = await findById(id);
	if (!existingTag) {
		throw new Error("Tag non trouvé");
	}

	let slug = existingTag.slug;
	
	// Si le nom change, générer un nouveau slug
	if (name && name !== existingTag.name) {
		slug = slugify(name, { lower: true, strict: true });
		
		// Vérifier que le nouveau slug est unique
		const existingSlug = await findBySlug(slug);
		if (existingSlug && existingSlug.id !== Number.parseInt(id, 10)) {
			throw new Error("Un tag avec ce nom existe déjà");
		}
	}

	const query = `
		UPDATE tags 
		SET name = COALESCE(?, name),
			slug = COALESCE(?, slug)
		WHERE id = ?
	`;

	await db.execute(query, [name, slug, id]);
	
	return await findById(id);
};

// ✅ Supprimer un tag
const remove = async (id) => {
	// Vérifier que le tag existe
	const existingTag = await findById(id);
	if (!existingTag) {
		throw new Error("Tag non trouvé");
	}

	// Vérifier qu'il n'est pas utilisé
	if (existingTag.articles_count > 0 || existingTag.illustrations_count > 0) {
		throw new Error("Impossible de supprimer ce tag car il est utilisé par des articles ou illustrations");
	}

	const query = `DELETE FROM tags WHERE id = ?`;
	const [result] = await db.execute(query, [id]);
	
	if (result.affectedRows === 0) {
		throw new Error("Tag non trouvé");
	}
	
	return { id: Number.parseInt(id, 10) };
};

// ✅ Obtenir les statistiques des tags
const getStats = async () => {
	const query = `
		SELECT 
			COUNT(*) as total_tags,
			COUNT(DISTINCT at.article_id) as tags_with_articles,
			COUNT(DISTINCT it.illustration_id) as tags_with_illustrations,
			COUNT(CASE WHEN at.article_id IS NULL AND it.illustration_id IS NULL THEN 1 END) as unused_tags
		FROM tags t
		LEFT JOIN article_tags at ON t.id = at.tag_id
		LEFT JOIN illustration_tags it ON t.id = it.tag_id
	`;

	const [rows] = await db.execute(query);
	return rows[0];
};

// ✅ Rechercher des tags par nom
const search = async (searchTerm, limit = 10) => {
	const query = `
		SELECT 
			t.id,
			t.name,
			t.slug,
			COUNT(DISTINCT at.article_id) as articles_count,
			COUNT(DISTINCT it.illustration_id) as illustrations_count
		FROM tags t
		LEFT JOIN article_tags at ON t.id = at.tag_id
		LEFT JOIN illustration_tags it ON t.id = it.tag_id
		WHERE t.name LIKE ? OR t.slug LIKE ?
		GROUP BY t.id
		ORDER BY t.name ASC
		LIMIT ?
	`;

	const searchPattern = `%${searchTerm}%`;
	const [rows] = await db.execute(query, [searchPattern, searchPattern, limit]);
	return rows;
};

module.exports = {
	findAll,
	countAll,
	findById,
	findBySlug,
	create,
	update,
	remove,
	getStats,
	search
};