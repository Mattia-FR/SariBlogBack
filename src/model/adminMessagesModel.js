const db = require("./db");

// ✅ Lister tous les messages avec pagination
const findAll = async (limit, offset) => {
	const query = `
		SELECT 
			id,
			name,
			email,
			subject,
			message,
			sender_ip,
			is_read,
			created_at
		FROM messages
		ORDER BY created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Compter le total de messages
const countAll = async () => {
	const query = "SELECT COUNT(*) as total FROM messages";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Compter les messages non lus
const countUnread = async () => {
	const query = "SELECT COUNT(*) as total FROM messages WHERE is_read = FALSE";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Récupérer un message par ID
const findById = async (id) => {
	const query = `
		SELECT 
			id,
			name,
			email,
			subject,
			message,
			sender_ip,
			is_read,
			created_at
		FROM messages
		WHERE id = ?
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Marquer un message comme lu
const markAsRead = async (id) => {
	const query = `
		UPDATE messages 
		SET is_read = TRUE 
		WHERE id = ?
	`;

	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Message non trouvé");
	}

	return { id: Number.parseInt(id, 10), is_read: true };
};

// ✅ Marquer un message comme non lu
const markAsUnread = async (id) => {
	const query = `
		UPDATE messages 
		SET is_read = FALSE 
		WHERE id = ?
	`;

	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Message non trouvé");
	}

	return { id: Number.parseInt(id, 10), is_read: false };
};

// ✅ Marquer tous les messages comme lus
const markAllAsRead = async () => {
	const query = "UPDATE messages SET is_read = TRUE WHERE is_read = FALSE";
	const [result] = await db.execute(query);

	return {
		updated_count: result.affectedRows,
		message: `${result.affectedRows} message(s) marqué(s) comme lu(s)`,
	};
};

// ✅ Supprimer un message
const remove = async (id) => {
	const query = "DELETE FROM messages WHERE id = ?";
	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Message non trouvé");
	}

	return { id: Number.parseInt(id, 10) };
};

// ✅ Supprimer tous les messages lus
const removeAllRead = async () => {
	const query = "DELETE FROM messages WHERE is_read = TRUE";
	const [result] = await db.execute(query);

	return {
		deleted_count: result.affectedRows,
		message: `${result.affectedRows} message(s) supprimé(s)`,
	};
};

// ✅ Obtenir les statistiques des messages
const getStats = async () => {
	const query = `
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN is_read = TRUE THEN 1 END) as read_count,
			COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_count,
			COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_count,
			COUNT(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as week_count
		FROM messages
	`;

	const [rows] = await db.execute(query);
	return rows[0];
};

module.exports = {
	findAll,
	countAll,
	countUnread,
	findById,
	markAsRead,
	markAsUnread,
	markAllAsRead,
	remove,
	removeAllRead,
	getStats,
};
