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
}
