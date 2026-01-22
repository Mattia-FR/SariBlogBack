import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/users";

// ========================================
// MIDDLEWARE DE VÉRIFICATION DES RÔLES
// ========================================
// Ce middleware vérifie que l'utilisateur authentifié a le rôle requis
// pour accéder à la route. Il DOIT être utilisé APRÈS requireAuth.
//
// Utilisation :
//   - requireRole("admin") : uniquement admin
//   - requireRole(["admin", "editor"]) : admin OU editor
//   - requireAdmin() : alias pour requireRole("admin")
//   - requireEditor() : alias pour requireRole(["admin", "editor"])
//
// Codes de retour :
//   - 401 : Utilisateur non authentifié (requireAuth non appelé)
//   - 403 : Rôle insuffisant (utilisateur authentifié mais pas les permissions)

/**
 * Middleware factory qui vérifie que l'utilisateur a un des rôles autorisés.
 * @param allowedRoles - Un rôle unique ou un tableau de rôles autorisés
 * @returns Middleware Express qui vérifie le rôle de l'utilisateur
 */
function requireRole(allowedRoles: UserRole | UserRole[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		// 1. Vérifier que requireAuth a été appelé avant
		if (!req.user || !req.user.role) {
			return res.sendStatus(401); // non authentifié
		}

		// 2. Normaliser les rôles autorisés en tableau
		const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

		// 3. Vérifier que le rôle de l'utilisateur est dans la liste autorisée
		const userRole = req.user.role as UserRole;
		if (!rolesArray.includes(userRole)) {
			return res.sendStatus(403); // rôle insuffisant
		}

		// 4. Rôle autorisé, on continue
		next();
	};
}

/**
 * Middleware qui vérifie que l'utilisateur est administrateur.
 * Alias pour requireRole("admin").
 */
function requireAdmin(req: Request, res: Response, next: NextFunction) {
	return requireRole("admin")(req, res, next);
}

/**
 * Middleware qui vérifie que l'utilisateur est admin OU éditeur.
 * Alias pour requireRole(["admin", "editor"]).
 */
function requireEditor(req: Request, res: Response, next: NextFunction) {
	return requireRole(["admin", "editor"])(req, res, next);
}

export { requireRole, requireAdmin, requireEditor };
