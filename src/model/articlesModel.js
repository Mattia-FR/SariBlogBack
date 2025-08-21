const db = require("./db");

const findLatestPublished = async (limit = 4) => {
	// On récupère l'id, le titre, le slug (URL-friendly), l'extrait, l'image, la date de création
	// GROUP_CONCAT permet de combiner tous les tags d'un article en une seule chaîne
	// On récupère même les articles sans tag avec LEFT JOIN
	// 1ère jointure : articles → article_tags (table de liaison)
	// 2ème jointure : article_tags → tags (récupérer les noms)
	// GROUP BY permet d'avoir une ligne par article et non une ligne par tag
	const [rows] = await db.query(
		`
    SELECT 
      a.id,
      a.title,
      a.slug,
      a.excerpt,
      a.image,
      a.created_at,
      GROUP_CONCAT(t.name ORDER BY t.name SEPARATOR ', ') as tags
    FROM articles a
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    WHERE a.status = 'published'
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `,
		[limit],
	);

	return rows;
};

module.exports = {
	findLatestPublished,
};
