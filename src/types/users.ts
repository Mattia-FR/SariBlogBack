export type UserRole = "admin" | "editor" | "subscriber";

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
	created_at: string;
	updated_at: string;
	avatarUrl?: string; // Optionnel : enrichi
}

export interface UserWithPassword extends User {
	password: string;
}

export interface UserCreateData {
	username: string;
	email: string;
	password: string;
	firstname?: string | null;
	lastname?: string | null;
	role?: UserRole;
	avatar?: string | null;
	bio?: string | null;
	bio_short?: string | null;
}

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
