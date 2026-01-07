import type { Request, Response } from "express";
import articlesModel from "../model/articlesModel";
import type { Article, ArticleListItem, ArticleForList } from "../types/articles";

// Configuration de l'URL de base pour les images
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";

/**
 * Fonction utilitaire pour enrichir un ArticleListItem avec l'URL complète de son image
 */
function enrichArticleListItemWithImageUrl(article: ArticleListItem): ArticleListItem & { imageUrl?: string } {
    // Si l'article a un featured_image_id mais pas encore d'imageUrl, on ne peut pas l'enrichir ici
    // car on n'a pas accès au path de l'image (il faudrait faire un JOIN en DB)
    return article;
}

/**
 * Fonction utilitaire pour enrichir un ArticleForList avec l'URL complète de son image
 */
function enrichArticleForListWithImageUrl(article: ArticleForList): ArticleForList {
    if (article.imageUrl) {
        return {
            ...article,
            imageUrl: `${IMAGE_BASE_URL}${article.imageUrl}`,
        };
    }
    return article;
}

/**
 * Fonction utilitaire pour enrichir un Article avec l'URL complète de son image
 * Note: Article n'a pas de imageUrl par défaut, donc cette fonction ne fait rien pour l'instant
 */
function enrichArticleWithImageUrl(article: Article): Article & { imageUrl?: string } {
    // Article n'a pas de imageUrl, il faudrait faire un JOIN pour récupérer le path
    // Cette fonction est préparée pour le futur si on ajoute l'enrichissement
    return article;
}

// Liste tous les articles (admin - tous statuts)
// GET /articles
const browseAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const articles: ArticleListItem[] = await articlesModel.findAll();
        // Pour l'instant, on ne peut pas enrichir car ArticleListItem n'a pas le path de l'image
        res.status(200).json(articles);
    } catch (err) {
        console.error("Erreur lors de la récupération de tous les articles :", err);
        res.sendStatus(500);
    }
};

// Récupère un article par ID (admin - tous statuts)
// GET /articles/:id
const readById = async (req: Request, res: Response): Promise<void> => {
    try {
        const articleId: number = Number.parseInt(req.params.id, 10);
        if (Number.isNaN(articleId)) {
            res.status(400).json({ error: "ID invalide" });
            return;
        }

        const article: Article | null = await articlesModel.findById(articleId);
        if (!article) {
            res.sendStatus(404);
            return;
        }

        // Article n'a pas de imageUrl, on le retourne tel quel
        res.status(200).json(article);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'article par ID :", err);
        res.sendStatus(500);
    }
};

// Récupère un article par slug (admin - tous statuts)
// GET /articles/slug/:slug
const readBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const slug: string = req.params.slug;
        if (!slug) {
            res.status(400).json({ error: "Slug invalide" });
            return;
        }

        const article: Article | null = await articlesModel.findBySlug(slug);
        if (!article) {
            res.sendStatus(404);
            return;
        }

        // Article n'a pas de imageUrl, on le retourne tel quel
        res.status(200).json(article);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'article par slug :", err);
        res.sendStatus(500);
    }
};

// Liste tous les articles publiés (public)
// GET /articles/published?limit=4 (optionnel, max 20)
const browsePublished = async (req: Request, res: Response): Promise<void> => {
    try {
        // Récupérer le paramètre limit depuis la query string (optionnel)
        const limitParam = req.query.limit;
        const limit = limitParam
            ? Number.parseInt(limitParam as string, 10)
            : undefined;

        // Valider que limit est un nombre positif si fourni
        if (limit !== undefined) {
            if (Number.isNaN(limit) || limit < 1) {
                res.status(400).json({ error: "Le paramètre limit doit être un nombre positif" });
                return;
            }
            if (limit > 20) {
                res.status(400).json({ error: "Le paramètre limit ne peut pas dépasser 20" });
                return;
            }
        }

        const articles: ArticleListItem[] = await articlesModel.findPublished(limit);
        // Pour l'instant, on ne peut pas enrichir car ArticleListItem n'a pas le path de l'image
        res.status(200).json(articles);
    } catch (err) {
        console.error("Erreur lors de la récupération des articles publiés :", err);
        res.sendStatus(500);
    }
};

// Récupère un article publié par slug (public)
// GET /articles/published/:slug
const readPublishedBySlug = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const slug: string = req.params.slug;
        if (!slug) {
            res.status(400).json({ error: "Slug invalide" });
            return;
        }

        const article: Article | null =
            await articlesModel.findPublishedBySlug(slug);
        if (!article) {
            res.sendStatus(404);
            return;
        }

        // Article n'a pas de imageUrl, on le retourne tel quel
        res.status(200).json(article);
    } catch (err) {
        console.error("Erreur lors de la récupération de l'article publié par slug :", err);
        res.sendStatus(500);
    }
};

/**
 * Récupère les 4 derniers articles pour la preview homepage
 * GET /articles/homepage-preview
 *
 * Endpoint optimisé qui retourne directement les articles enrichis
 * avec leurs images et tags en une seule requête.
 */
const readHomepagePreview = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const articles: ArticleForList[] =
            await articlesModel.findHomepagePreview();
        
        // Enrichir les articles avec l'URL complète
        const enrichedArticles = articles.map(enrichArticleForListWithImageUrl);
        
        res.status(200).json(enrichedArticles);
    } catch (err) {
        console.error(
            "Erreur lors de la récupération de la preview homepage :",
            err,
        );
        res.sendStatus(500);
    }
};

export {
    browseAll,
    readById,
    readBySlug,
    browsePublished,
    readPublishedBySlug,
    readHomepagePreview,
};