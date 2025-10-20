const db = require("./db");

// ✅ Lister toutes les illustrations (galerie + non-galerie) avec pagination
const findAll = async (limit, offset) => {
	console.info("🔍 [MODEL ILLUSTRATIONS] Début de findAll");
	console.info("🔍 [MODEL ILLUSTRATIONS] Limit:", limit, "Offset:", offset);

	const query = `
		SELECT 
			i.id,
			i.title,
			i.description,
			i.image,
			i.alt_text,
			i.is_in_gallery,
			i.created_at,
			GROUP_CONCAT(
				JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug) 
				SEPARATOR '|||'
			) as tags_json
		FROM illustrations i
		LEFT JOIN illustration_tags it ON i.id = it.illustration_id
		LEFT JOIN tags t ON it.tag_id = t.id
		GROUP BY i.id
		ORDER BY i.created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	console.info("🔍 [MODEL ILLUSTRATIONS] Requête SQL:", query);

	try {
		const [rows] = await db.execute(query);
		console.info("🔍 [MODEL ILLUSTRATIONS] Rows brutes:", rows.length);
		console.info("🔍 [MODEL ILLUSTRATIONS] Première row brute:", rows[0]);

		// ✅ Transformer les données pour correspondre à la structure attendue
		const transformedRows = rows.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			image: row.image,
			alt_text: row.alt_text,
			is_in_gallery: Boolean(row.is_in_gallery),
			created_at: row.created_at,
			updated_at: row.created_at, // ✅ Utiliser created_at comme updated_at
			tags: row.tags_json
				? row.tags_json.split("|||").map((tagStr) => JSON.parse(tagStr))
				: [],
		}));

		console.info(
			"🔍 [MODEL ILLUSTRATIONS] Rows transformées:",
			transformedRows.length,
		);
		console.info(
			"🔍 [MODEL ILLUSTRATIONS] Première row transformée:",
			transformedRows[0],
		);

		return transformedRows;
	} catch (error) {
		console.error("❌ [MODEL ILLUSTRATIONS] Erreur SQL:", error);
		throw error;
	}
};

// ✅ Compter le total d'illustrations
const countAll = async () => {
	console.info("🔍 [MODEL ILLUSTRATIONS] Début de countAll");

	const query = "SELECT COUNT(*) as total FROM illustrations";
	console.info("🔍 [MODEL ILLUSTRATIONS] Requête count:", query);

	try {
		const [rows] = await db.execute(query);
		console.info("🔍 [MODEL ILLUSTRATIONS] Count result:", rows[0]);
		return rows[0].total;
	} catch (error) {
		console.error("❌ [MODEL ILLUSTRATIONS] Erreur count:", error);
		throw error;
	}
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
			GROUP_CONCAT(
				JSON_OBJECT('id', t.id, 'name', t.name, 'slug', t.slug) 
				SEPARATOR '|||'
			) as tags_json
		FROM illustrations i
		LEFT JOIN illustration_tags it ON i.id = it.illustration_id
		LEFT JOIN tags t ON it.tag_id = t.id
		WHERE i.id = ?
		GROUP BY i.id
	`;

	const [rows] = await db.execute(query, [id]);

	if (!rows[0]) return null;

	const row = rows[0];
	return {
		id: row.id,
		title: row.title,
		description: row.description,
		image: row.image,
		alt_text: row.alt_text,
		is_in_gallery: Boolean(row.is_in_gallery),
		created_at: row.created_at,
		updated_at: row.created_at, // ✅ Utiliser created_at comme updated_at
		tags: row.tags_json
			? row.tags_json.split("|||").map((tagStr) => JSON.parse(tagStr))
			: [],
	};
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
		updated_at: new Date().toISOString(),
		tags: [],
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
