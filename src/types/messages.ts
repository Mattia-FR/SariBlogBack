import type { RowDataPacket } from "mysql2/promise";

// Interface représentant une ligne brute de la table messages
export interface MessageRow extends RowDataPacket {
	id: number;
	firstname: string;
	lastname: string;
	email: string;
	ip: string | null;
	subject: string;
	text: string;
	status: "unread" | "read" | "archived";
	user_id: number | null;
	created_at: Date;
}

// Interface publique pour exposer un message
export interface Message extends MessageRow {}

// Interface pour créer un nouveau message (formulaire de contact)
export interface MessageCreateData {
	firstname: string;
	lastname: string;
	email: string;
	ip?: string | null;
	subject: string;
	text: string;
	user_id?: number | null;
}

// Interface pour mettre à jour le statut d'un message (admin uniquement)
export interface MessageUpdateData {
	status?: "unread" | "read" | "archived";
}
