// Type pour le statut d'un message
export type MessageStatus = "unread" | "read" | "archived";

// Interface pour un message complet
export interface Message {
	id: number;
	firstname: string | null;
	lastname: string | null;
	email: string;
	username: string | null;
	ip: string | null;
	subject: string;
	text: string;
	status: MessageStatus;
	user_id: number | null;
	created_at: Date;
}

// Interface pour créer un nouveau message (formulaire de contact)
export interface MessageCreateData {
	firstname?: string | null;
	lastname?: string | null;
	email: string;
	username?: string | null;
	ip?: string | null;
	subject: string;
	text: string;
	user_id?: number | null;
}

// Interface pour mettre à jour le statut d'un message (admin uniquement)
export interface MessageUpdateData {
	status?: MessageStatus;
}
