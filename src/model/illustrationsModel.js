const db = require("./db");

const findGalleryPreview = async (limit = 6) => {
  // On récupère seulement les infos essentielles pour le carrousel
  const [rows] = await db.query(
    `
    SELECT 
      i.id,
      i.title,
      i.image,
      i.alt_text
    FROM illustrations i
    WHERE i.is_in_gallery = TRUE
    ORDER BY i.created_at DESC
    LIMIT ?
  `,
    [limit],
  );

  return rows;
};

module.exports = {
  findGalleryPreview,
};