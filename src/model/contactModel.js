const db = require("./db");

// ✅ Créer un nouveau message de contact
const create = async ({ name, email, subject, message, senderIp }) => {
	// On insère le message avec l'IP de l'expéditeur pour la sécurité
	// On retourne l'ID généré et les données du message
	const query = `
		INSERT INTO messages (name, email, subject, message, sender_ip)
		VALUES (?, ?, ?, ?, ?)
	`;

	const [result] = await db.execute(query, [
		name,
		email,
		subject,
		message,
		senderIp,
	]);

	return {
		id: result.insertId,
		name,
		email,
		subject,
		message,
		created_at: new Date().toISOString(),
	};
};

module.exports = {
	create,
};
