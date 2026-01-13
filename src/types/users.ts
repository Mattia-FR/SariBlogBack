// ========================================
// TYPES PUBLICS pour les utilisateurs
// ========================================

// Type pour le rôle d'un utilisateur
export type UserRole = "admin" | "editor" | "subscriber";

// Interface publique pour un utilisateur (sans password pour sécurité).
// Utilisée dans les réponses API publiques.
export interface User {
	id: number;
	username: string;
	email: string;
	firstname: string | null;
	lastname: string | null;
	role: UserRole;
	avatar: string | null;
	bio: string | null;
	bio_short: string | null;
	created_at: Date;
	updated_at: Date;
}

// Interface avec password (pour l'authentification uniquement).
// ⚠️ À utiliser UNIQUEMENT dans les fonctions de login/auth, jamais exposée publiquement.
export interface UserWithPassword extends User {
	password: string;
}

// Interface pour la mise à jour partielle des données utilisateur.
// Tous les champs sont optionnels pour permettre des updates flexibles.
// Le password n'est pas inclus (géré par une fonction dédiée).
export interface UserUpdateData {
	username?: string;
	email?: string;
	firstname?: string | null;
	lastname?: string | null;
	role?: UserRole;
	avatar?: string | null;
	bio?: string | null;
	bio_short?: string | null;
}

// Interface pour la création d'un nouvel utilisateur.
// Les champs obligatoires sont : username, email, password.
// ⚠️ Le password doit être hashé AVANT insertion !
export interface UserCreateData {
	username: string;
	email: string;
	password: string; // Doit être hashé avec Argon2 avant insertion !
	firstname?: string | null;
	lastname?: string | null;
	role?: UserRole;
	avatar?: string | null;
	bio?: string | null;
	bio_short?: string | null;
}
