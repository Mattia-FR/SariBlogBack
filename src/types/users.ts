import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table users en base de données.
// Extends RowDataPacket pour être compatible avec mysql2/promise.
export interface UserRow extends RowDataPacket {
	id: number;
	username: string;
	email: string;
	password: string;
	firstname: string | null;
	lastname: string | null;
	role: "admin" | "editor" | "subscriber";
	avatar: string | null;
	bio: string | null;
	created_at: Date;
	updated_at: Date;
}

// Interface publique sans le password (pour les réponses API).
// Utilisée pour exposer les données utilisateur de manière sécurisée.
export interface User extends Omit<UserRow, "password"> {}

// Interface avec password (pour l'authentification uniquement).
// Utilisée lors de la vérification des credentials (login).
export interface UserWithPassword extends UserRow {}

// Interface pour la mise à jour partielle des données utilisateur.
// Tous les champs sont optionnels pour permettre des updates flexibles.
// Le password n'est pas inclus (géré par une fonction dédiée).
export interface UserUpdateData {
	username?: string;
	email?: string;
	firstname?: string | null;
	lastname?: string | null;
	role?: "admin" | "editor" | "subscriber";
	avatar?: string | null;
	bio?: string | null;
}

// Interface pour la création d'un nouvel utilisateur.
// Les champs obligatoires sont : username, email, password.
// Le role a une valeur par défaut 'subscriber' en base de données.
export interface UserCreateData {
	username: string;
	email: string;
	password: string; // Doit être hashé avant insertion !
	firstname?: string | null;
	lastname?: string | null;
	role?: "admin" | "editor" | "subscriber";
	avatar?: string | null;
	bio?: string | null;
}