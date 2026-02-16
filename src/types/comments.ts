export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Comment {
	id: number;
	text: string;
	created_at: string;
	user_id: number;
	username: string;
	avatar: string | null;
	firstname: string | null;
	lastname: string | null;
	status?: CommentStatus;
	article_id?: number;
}

export interface CommentUpdateData {
	status?: CommentStatus;
}

export interface CommentCreateData {
	text: string;
	user_id: number;
	article_id: number;
}
