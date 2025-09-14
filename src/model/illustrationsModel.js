const db = require("./db");

// ✅ Garde ta fonction actuelle - elle est parfaite !
const findGalleryPreview = async (limit = 6) => {
	// On récupère seulement les infos essentielles pour le carrousel
	const query = `
    SELECT 
      i.id,
      i.title,
      i.image,
      i.alt_text
    FROM illustrations i
    WHERE i.is_in_gallery = TRUE
    ORDER BY i.created_at DESC
    LIMIT ${Number.parseInt(limit, 10) || 6}
  `;
	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Nouvelle fonction simple pour la page galerie
const findAllInGallery = async (limit, offset) => {
	const query = `
    SELECT 
      i.id,
      i.title,
      i.description,
      i.image,
      i.alt_text,
      DATE_FORMAT(i.created_at, '%d/%m/%Y') as created_at
    FROM illustrations i
    WHERE i.is_in_gallery = TRUE
    ORDER BY i.created_at DESC
    LIMIT ? OFFSET ?
  `;

	const [rows] = await db.execute(query, [limit, offset]);
	return rows;
};

// ✅ Compter le total pour la pagination
const countInGallery = async () => {
	const query =
		"SELECT COUNT(*) as total FROM illustrations WHERE is_in_gallery = TRUE";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer une illustration par ID
const findById = async (id) => {
	const query = `
    SELECT 
      i.id,
      i.title,
      i.description,
      i.image,
      i.alt_text,
      DATE_FORMAT(i.created_at, '%d/%m/%Y') as created_at
    FROM illustrations i
    WHERE i.id = ? AND i.is_in_gallery = TRUE
  `;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

module.exports = {
	findGalleryPreview,
	findAllInGallery,
	countInGallery,
	findById,
};
