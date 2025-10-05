const db = require("./db");
const slugify = require("slugify");

// ✅ Lister tous les articles (publiés + brouillons) avec pagination
const findAll = async (limit, offset) => {
	const query = `
	  SELECT
		a.id,
		a.title,
		a.slug,
		a.excerpt,
		a.content,
		a.image,
		a.status,
		a.created_at,
		a.updated_at,
		GROUP_CONCAT(
		  JSON_OBJECT('id', t.id, 'name', t.name)
		  SEPARATOR '|||'
		) as tags
	  FROM articles a
	  LEFT JOIN article_tags at ON a.id = at.article_id
	  LEFT JOIN tags t ON at.tag_id = t.id
	  GROUP BY a.id
	  ORDER BY a.created_at DESC
	  LIMIT ? OFFSET ?
	`;
	
	const [articles] = await db.execute(query, [
	  Number.parseInt(limit, 10) || 10,
	  Number.parseInt(offset, 10) || 0
	]);
	
	// Parser les tags JSON de manière sécurisée
	return articles.map(article => ({
	  ...article,
	  tags: article.tags 
		? article.tags.split('|||').map(tag => JSON.parse(tag))
		: []
	}));
  };

// ✅ Compter le total d'articles
const countAll = async () => {
	const query = "SELECT COUNT(*) as total FROM articles";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer un article par ID (pour l'admin)
const findById = async (id) => {
	const query = `
		SELECT 
			a.id, 
			a.title, 
			a.slug, 
			a.excerpt, 
			a.content,
			a.image, 
			a.status,
			a.created_at,
			a.updated_at,
			GROUP_CONCAT(t.id SEPARATOR ',') as tag_ids,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM articles a
		LEFT JOIN article_tags at ON a.id = at.article_id
		LEFT JOIN tags t ON at.tag_id = t.id
		WHERE a.id = ?
		GROUP BY a.id
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Créer un nouvel article
const create = async ({
	title,
	excerpt,
	content,
	image,
	status = "draft",
	tagIds = [],
}) => {
	const slug = slugify(title, { lower: true, strict: true });

	// Vérifier que le slug est unique
	const existingSlug = await findBySlug(slug);
	if (existingSlug) {
		throw new Error("Un article avec ce titre existe déjà");
	}

	const query = `
		INSERT INTO articles (title, slug, excerpt, content, image, status)
		VALUES (?, ?, ?, ?, ?, ?)
	`;

	const [result] = await db.execute(query, [
		title,
		slug,
		excerpt,
		content,
		image,
		status,
	]);
	const articleId = result.insertId;

	// Ajouter les tags si fournis
	if (tagIds.length > 0) {
		await addTagsToArticle(articleId, tagIds);
	}

	return {
		id: articleId,
		title,
		slug,
		excerpt,
		content,
		image,
		status,
		created_at: new Date().toISOString(),
	};
};

// ✅ Modifier un article
const update = async (
	id,
	{ title, excerpt, content, image, status, tagIds = [] },
) => {
	// Récupérer l'article existant
	const existingArticle = await findById(id);
	if (!existingArticle) {
		throw new Error("Article non trouvé");
	}

	let slug = existingArticle.slug;

	// Si le titre change, générer un nouveau slug
	if (title && title !== existingArticle.title) {
		slug = slugify(title, { lower: true, strict: true });

		// Vérifier que le nouveau slug est unique
		const existingSlug = await findBySlug(slug);
		if (existingSlug && existingSlug.id !== Number.parseInt(id, 10)) {
			throw new Error("Un article avec ce titre existe déjà");
		}
	}

	const query = `
		UPDATE articles 
		SET title = COALESCE(?, title),
			slug = COALESCE(?, slug),
			excerpt = COALESCE(?, excerpt),
			content = COALESCE(?, content),
			image = COALESCE(?, image),
			status = COALESCE(?, status),
			updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [title, slug, excerpt, content, image, status, id]);

	// Mettre à jour les tags si fournis
	if (tagIds.length >= 0) {
		await updateArticleTags(id, tagIds);
	}

	return await findById(id);
};

// ✅ Supprimer un article
const remove = async (id) => {
	const query = "DELETE FROM articles WHERE id = ?";
	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Article non trouvé");
	}

	return { id: Number.parseInt(id, 10) };
};

// ✅ Récupérer un article par slug (pour vérification d'unicité)
const findBySlug = async (slug) => {
	const query = "SELECT id, title, slug FROM articles WHERE slug = ?";
	const [rows] = await db.execute(query, [slug]);
	return rows[0] || null;
};

// ✅ Ajouter des tags à un article
const addTagsToArticle = async (articleId, tagIds) => {
	// Supprimer les tags existants
	await db.execute("DELETE FROM article_tags WHERE article_id = ?", [
		articleId,
	]);

	// Ajouter les nouveaux tags
	if (tagIds.length > 0) {
		const values = tagIds.map((tagId) => `(${articleId}, ${tagId})`).join(", ");
		const query = `INSERT INTO article_tags (article_id, tag_id) VALUES ${values}`;
		await db.execute(query);
	}
};

// ✅ Mettre à jour les tags d'un article
const updateArticleTags = async (articleId, tagIds) => {
	// Supprimer les tags existants
	await db.execute("DELETE FROM article_tags WHERE article_id = ?", [
		articleId,
	]);

	// Ajouter les nouveaux tags
	if (tagIds.length > 0) {
		const values = tagIds.map((tagId) => `(${articleId}, ${tagId})`).join(", ");
		const query = `INSERT INTO article_tags (article_id, tag_id) VALUES ${values}`;
		await db.execute(query);
	}
};

// ✅ Récupérer tous les tags disponibles
const getAllTags = async () => {
	const query = "SELECT id, name, slug FROM tags ORDER BY name";
	const [rows] = await db.execute(query);
	return rows;
};

module.exports = {
	findAll,
	countAll,
	findById,
	create,
	update,
	remove,
	findBySlug,
	getAllTags,
};
