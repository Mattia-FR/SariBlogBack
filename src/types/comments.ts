export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Comment {
	id: number;
	text: string;
	created_at: string;
	user_id: number | null;
	username: string | null;
	avatar: string | null;
	firstname: string | null;
	lastname: string | null;
	email?: string | null;
	status?: CommentStatus;
	article_id?: number;
}

export interface CommentUpdateData {
	status?: CommentStatus;
}

export interface CommentCreateData {
	text: string;
	article_id: number;
	user_id?: number | null;
	firstname?: string | null;
	lastname?: string | null;
	email?: string | null;
}
