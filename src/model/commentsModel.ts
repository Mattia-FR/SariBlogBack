import pool from "./db";
import type { Comment } from "../types/comments";
import { toDateString } from "../utils/dateHelpers";

// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Comment.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.

const findApprovedByArticleId = async (id: number): Promise<Comment[]> => {
	try {
		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		const [rows]: any = await pool.query(
			`SELECT c.id, c.text, c.created_at, u.id as user_id, u.username, u.avatar, u.firstname, u.lastname
			FROM comments c
			INNER JOIN users u ON c.user_id = u.id
			WHERE c.article_id = ? AND c.status = 'approved'
			ORDER BY c.created_at DESC`,
			[id],
		);

		// biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
		return rows.map((comment: any) => ({
			id: comment.id,
			text: comment.text,
			created_at: toDateString(comment.created_at) ?? "",
			user_id: comment.user_id,
			username: comment.username,
			avatar: comment.avatar,
			firstname: comment.firstname,
			lastname: comment.lastname,
		}));
	} catch (err) {
		console.error(err);
		throw err;
	}
};

export default {
	findApprovedByArticleId,
};
