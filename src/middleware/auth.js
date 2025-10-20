/**
 * Middlewares d'authentification et d'autorisation
 * 
 * Gère la sécurité des routes protégées de l'API :
 * - Vérification des tokens JWT
 * - Validation de l'identité utilisateur
 * - Contrôle des permissions par rôle
 * 
 * Architecture : Ces middlewares s'appliquent AVANT les contrôleurs
 * pour garantir que seuls les utilisateurs autorisés accèdent aux routes admin.
 */

const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

// ===== MIDDLEWARE D'AUTHENTIFICATION =====

/**
 * Vérifie la validité du token JWT et charge l'utilisateur
 * 
 * Processus :
 * 1. Extrait le token depuis le header Authorization (format: "Bearer <token>")
 * 2. Vérifie la signature du token avec JWT_SECRET
 * 3. Récupère l'utilisateur depuis la base de données
 * 4. Injecte l'utilisateur dans req.user pour les middlewares suivants
 * 
 * Gestion des erreurs :
 * - 401 NO_TOKEN : Aucun token fourni
 * - 401 INVALID_TOKEN : Token malformé ou signature invalide
 * - 401 TOKEN_EXPIRED : Token expiré (durée définie lors de la génération)
 * - 500 AUTH_ERROR : Erreur serveur inattendue
 * 
 * @middleware
 * @example
 * router.get("/admin/articles", authenticateToken, adminController.getArticles);
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Extraction du token depuis les headers
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1]; // Format attendu : "Bearer <token>"

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "NO_TOKEN",
                    message: "Token d'accès requis",
                },
            });
        }

        // Vérification de la signature JWT
        // Si invalide ou expiré, jwt.verify() lance une exception
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Récupération de l'utilisateur depuis la base de données
        // Garantit que l'utilisateur existe encore et n'a pas été supprimé
        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token invalide",
                },
            });
        }

        // Injection de l'utilisateur dans la requête
        // Accessible dans tous les middlewares/contrôleurs suivants via req.user
        req.user = user;
        next(); // Passer au middleware suivant
    } catch (error) {
        // Gestion des erreurs spécifiques JWT
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token invalide", // Signature incorrecte ou token malformé
                },
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                error: {
                    code: "TOKEN_EXPIRED",
                    message: "Token expiré", // Durée de vie dépassée (définie à 24h)
                },
            });
        }

        // Erreur serveur inattendue (ex: base de données inaccessible)
        console.error("Erreur d'authentification:", error);
        res.status(500).json({
            success: false,
            error: {
                code: "AUTH_ERROR",
                message: "Erreur d'authentification",
            },
        });
    }
};

// ===== MIDDLEWARE DE CONTRÔLE DES RÔLES =====

/**
 * Vérifie que l'utilisateur authentifié possède l'un des rôles autorisés
 * 
 * IMPORTANT : Ce middleware doit être appliqué APRÈS authenticateToken
 * car il dépend de req.user injecté par authenticateToken.
 * 
 * Processus :
 * 1. Vérifie que req.user existe (utilisateur authentifié)
 * 2. Compare le rôle de l'utilisateur avec les rôles autorisés
 * 3. Bloque l'accès avec 403 si le rôle ne correspond pas
 * 
 * @param {string[]} roles - Liste des rôles autorisés (ex: ["admin", "editor"])
 * @returns {Function} Middleware Express
 * 
 * @example
 * // Seuls les admins peuvent supprimer
 * router.delete("/admin/articles/:id", 
 *   authenticateToken, 
 *   requireRole(["admin"]), 
 *   adminController.deleteArticle
 * );
 * 
 * // Admins et éditeurs peuvent créer
 * router.post("/admin/articles", 
 *   authenticateToken, 
 *   requireRole(["admin", "editor"]), 
 *   adminController.createArticle
 * );
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        // Vérification de sécurité : l'utilisateur doit être authentifié
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: "NO_USER",
                    message: "Utilisateur non authentifié",
                },
            });
        }

        // Vérification des permissions
        // Si le rôle de l'utilisateur n'est pas dans la liste autorisée → 403 Forbidden
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: "INSUFFICIENT_PERMISSIONS",
                    message: "Permissions insuffisantes",
                },
            });
        }

        next(); // Permissions OK → Passer au middleware/contrôleur suivant
    };
};

// ===== EXPORTS =====

module.exports = {
    authenticateToken,
    requireRole,
};