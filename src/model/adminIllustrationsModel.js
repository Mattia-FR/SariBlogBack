const db = require("./db");

// ✅ Lister toutes les illustrations (galerie + non-galerie) avec pagination
const findAll = async (limit, offset) => {
	const query = `
		SELECT 
			i.id,
			i.title,
			i.description,
			i.image,
			i.alt_text,
			i.is_in_gallery,
			i.created_at,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM illustrations i
		LEFT JOIN illustration_tags it ON i.id = it.illustration_id
		LEFT JOIN tags t ON it.tag_id = t.id
		GROUP BY i.id
		ORDER BY i.created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Compter le total d'illustrations
const countAll = async () => {
	const query = "SELECT COUNT(*) as total FROM illustrations";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer une illustration par ID (pour l'admin)
const findById = async (id) => {
	const query = `
		SELECT 
			i.id,
			i.title,
			i.description,
			i.image,
			i.alt_text,
			i.is_in_gallery,
			i.created_at,
			GROUP_CONCAT(t.id SEPARATOR ',') as tag_ids,
			GROUP_CONCAT(t.name SEPARATOR ', ') as tags
		FROM illustrations i
		LEFT JOIN illustration_tags it ON i.id = it.illustration_id
		LEFT JOIN tags t ON it.tag_id = t.id
		WHERE i.id = ?
		GROUP BY i.id
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Créer une nouvelle illustration
const create = async ({
	title,
	description,
	image,
	alt_text,
	is_in_gallery = false,
	tagIds = [],
}) => {
	const query = `
		INSERT INTO illustrations (title, description, image, alt_text, is_in_gallery)
		VALUES (?, ?, ?, ?, ?)
	`;

	const [result] = await db.execute(query, [
		title,
		description,
		image,
		alt_text,
		is_in_gallery,
	]);
	const illustrationId = result.insertId;

	// Ajouter les tags si fournis
	if (tagIds.length > 0) {
		await addTagsToIllustration(illustrationId, tagIds);
	}

	return {
		id: illustrationId,
		title,
		description,
		image,
		alt_text,
		is_in_gallery,
		created_at: new Date().toISOString(),
	};
};

// ✅ Modifier une illustration
const update = async (
	id,
	{ title, description, image, alt_text, is_in_gallery, tagIds = [] },
) => {
	// Récupérer l'illustration existante
	const existingIllustration = await findById(id);
	if (!existingIllustration) {
		throw new Error("Illustration non trouvée");
	}

	const query = `
		UPDATE illustrations 
		SET title = COALESCE(?, title),
			description = COALESCE(?, description),
			image = COALESCE(?, image),
			alt_text = COALESCE(?, alt_text),
			is_in_gallery = COALESCE(?, is_in_gallery)
		WHERE id = ?
	`;

	await db.execute(query, [
		title,
		description,
		image,
		alt_text,
		is_in_gallery,
		id,
	]);

	// Mettre à jour les tags si fournis
	if (tagIds.length >= 0) {
		await updateIllustrationTags(id, tagIds);
	}

	return await findById(id);
};

// ✅ Supprimer une illustration
const remove = async (id) => {
	const query = "DELETE FROM illustrations WHERE id = ?";
	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Illustration non trouvée");
	}

	return { id: Number.parseInt(id, 10) };
};

// ✅ Ajouter des tags à une illustration
const addTagsToIllustration = async (illustrationId, tagIds) => {
	// Supprimer les tags existants
	await db.execute("DELETE FROM illustration_tags WHERE illustration_id = ?", [
		illustrationId,
	]);

	// Ajouter les nouveaux tags
	if (tagIds.length > 0) {
		const values = tagIds
			.map((tagId) => `(${illustrationId}, ${tagId})`)
			.join(", ");
		const query = `INSERT INTO illustration_tags (illustration_id, tag_id) VALUES ${values}`;
		await db.execute(query);
	}
};

// ✅ Mettre à jour les tags d'une illustration
const updateIllustrationTags = async (illustrationId, tagIds) => {
	// Supprimer les tags existants
	await db.execute("DELETE FROM illustration_tags WHERE illustration_id = ?", [
		illustrationId,
	]);

	// Ajouter les nouveaux tags
	if (tagIds.length > 0) {
		const values = tagIds
			.map((tagId) => `(${illustrationId}, ${tagId})`)
			.join(", ");
		const query = `INSERT INTO illustration_tags (illustration_id, tag_id) VALUES ${values}`;
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
	getAllTags,
};
