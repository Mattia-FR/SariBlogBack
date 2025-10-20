/**
 * Modèle Articles - Accès aux données des articles publiés
 * 
 * Ce modèle gère uniquement les articles avec status='published'
 * pour l'interface publique. Les opérations admin sont dans adminArticlesModel.js
 */

const db = require("./db");

// ===== RÉCUPÉRATION DES DERNIERS ARTICLES =====

/**
 * Récupère les derniers articles publiés pour la page d'accueil
 * 
 * Utilise une requête complexe avec :
 * - LEFT JOIN pour inclure les articles sans tags
 * - GROUP_CONCAT pour agréger les tags en une seule chaîne
 * - GROUP BY pour éviter la duplication d'articles (relation many-to-many)
 * 
 * @param {number} limit - Nombre d'articles à récupérer (défaut: 4)
 * @returns {Promise<Array>} Liste des articles avec leurs tags
 * 
 * @example
 * const latestArticles = await findLatestPublished(3);
 * // Retourne : [{ id: 1, title: "...", tags: "Portrait, Encre" }, ...]
 */
const findLatestPublished = async (limit = 4) => {
    const query = `
        SELECT
            a.id,
            a.title,
            a.slug,              -- URL-friendly pour SEO
            a.excerpt,           -- Court résumé de l'article
            a.image,             -- Image de couverture
            a.created_at,        -- Date de publication (format ISO)
            GROUP_CONCAT(t.name SEPARATOR ', ') as tags  -- Tags combinés en chaîne
        FROM articles a
        LEFT JOIN article_tags at ON a.id = at.article_id    -- Table de liaison
        LEFT JOIN tags t ON at.tag_id = t.id                 -- Récupération des noms
        WHERE a.status = 'published'                          -- Seulement articles publiés
        GROUP BY a.id                                         -- Une ligne par article
        ORDER BY a.created_at DESC                            -- Plus récents en premier
        LIMIT ${Number.parseInt(limit, 10) || 4}              -- Protection injection SQL
    `;
    
    const [rows] = await db.execute(query);
    return rows;
};

// ===== PAGINATION DES ARTICLES =====

/**
 * Récupère tous les articles publiés avec pagination
 * 
 * Identique à findLatestPublished mais avec support de l'offset pour la pagination.
 * Utilisé sur la page /blog pour afficher tous les articles par pages de 10.
 * 
 * @param {number} limit - Nombre d'articles par page (défaut: 10)
 * @param {number} offset - Position de départ (défaut: 0)
 * @returns {Promise<Array>} Liste paginée des articles
 * 
 * @example
 * // Récupérer la page 2 (articles 11 à 20)
 * const page2 = await findAllPublished(10, 10);
 */
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

/**
 * Compte le nombre total d'articles publiés
 * 
 * Utilisé pour calculer le nombre de pages dans la pagination.
 * Requête simple et performante sans jointures inutiles.
 * 
 * @returns {Promise<number>} Nombre total d'articles publiés
 * 
 * @example
 * const total = await countPublished(); // 32
 * const totalPages = Math.ceil(total / 10); // 4 pages
 */
const countPublished = async () => {
    const query = `
        SELECT COUNT(*) as total 
        FROM articles 
        WHERE status = 'published'
    `;
    
    const [rows] = await db.execute(query);
    return rows[0].total;
};

// ===== RÉCUPÉRATION D'UN ARTICLE INDIVIDUEL =====

/**
 * Récupère un article publié par son slug (URL)
 * 
 * Inclut le contenu complet de l'article (non présent dans les listes).
 * Retourne null si l'article n'existe pas ou n'est pas publié.
 * 
 * @param {string} slug - Identifiant URL de l'article (ex: "premiers-croquis-2025")
 * @returns {Promise<Object|null>} Article complet ou null si introuvable
 * 
 * @example
 * const article = await findBySlug("premiers-croquis-2025");
 * if (!article) {
 *   // Gérer erreur 404
 * }
 */
const findBySlug = async (slug) => {
    const query = `
        SELECT
            a.id,
            a.title,
            a.slug,
            a.excerpt,
            a.content,           -- Contenu complet (uniquement pour page article)
            a.image,
            a.created_at,
            GROUP_CONCAT(t.name SEPARATOR ', ') as tags
        FROM articles a
        LEFT JOIN article_tags at ON a.id = at.article_id
        LEFT JOIN tags t ON at.tag_id = t.id
        WHERE a.slug = ? AND a.status = 'published'  -- Requête préparée (protection injection)
        GROUP BY a.id
    `;
    
    const [rows] = await db.execute(query, [slug]); // Paramètre échappé automatiquement
    return rows[0] || null; // Retourne null si aucun résultat
};

// ===== EXPORTS =====

module.exports = {
    findLatestPublished,
    findAllPublished,
    countPublished,
    findBySlug,
};