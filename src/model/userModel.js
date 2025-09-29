const argon2 = require("argon2");

// ✅ Créer un nouvel utilisateur
const create = async ({ username, email, password, role = "editor" }) => {
	// Hasher le mot de passe avec argon2
	const passwordHash = await argon2.hash(password);

	const query = `
		INSERT INTO users (username, email, password_hash, role)
		VALUES (?, ?, ?, ?)
	`;

	const [result] = await db.execute(query, [
		username,
		email,
		passwordHash,
		role,
	]);

	return {
		id: result.insertId,
		username,
		email,
		role,
		created_at: new Date().toISOString(),
	};
};

// ✅ Récupérer un utilisateur par email (pour l'authentification)
const findByEmail = async (email) => {
	const query = `
		SELECT id, username, email, password_hash, role, is_active, last_login, created_at
		FROM users 
		WHERE email = ? AND is_active = TRUE
	`;

	const [rows] = await db.execute(query, [email]);
	return rows[0] || null;
};

// ✅ Récupérer un utilisateur par ID
const findById = async (id) => {
	const query = `
		SELECT id, username, email, role, is_active, last_login, created_at
		FROM users 
		WHERE id = ? AND is_active = TRUE
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Lister tous les utilisateurs avec pagination
const findAll = async (limit, offset) => {
	const query = `
		SELECT 
			id,
			username,
			email,
			role,
			is_active,
			last_login,
			created_at,
			updated_at
		FROM users
		ORDER BY created_at DESC
		LIMIT ${Number.parseInt(limit, 10) || 10} OFFSET ${Number.parseInt(offset, 10) || 0}
	`;

	const [rows] = await db.execute(query);
	return rows;
};

// ✅ Compter le total d'utilisateurs
const countAll = async () => {
	const query = "SELECT COUNT(*) as total FROM users";
	const [rows] = await db.execute(query);
	return rows[0].total;
};

// ✅ Mettre à jour la dernière connexion
const updateLastLogin = async (id) => {
	const query = `
		UPDATE users 
		SET last_login = NOW() 
		WHERE id = ?
	`;

	await db.execute(query, [id]);
};

// ✅ Vérifier le mot de passe
const verifyPassword = async (password, hash) => {
	return await argon2.verify(hash, password);
};

// ✅ Modifier un utilisateur
const update = async (id, { username, email, role, is_active }) => {
	const query = `
		UPDATE users 
		SET username = COALESCE(?, username),
			email = COALESCE(?, email),
			role = COALESCE(?, role),
			is_active = COALESCE(?, is_active),
			updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [username, email, role, is_active, id]);

	return await findById(id);
};

// ✅ Désactiver un utilisateur
const deactivate = async (id) => {
	const query = `
		UPDATE users 
		SET is_active = FALSE, updated_at = NOW() 
		WHERE id = ?
	`;

	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Utilisateur non trouvé");
	}

	return { id: Number.parseInt(id, 10), is_active: false };
};

// ✅ Changer le mot de passe
const changePassword = async (id, newPassword) => {
	const passwordHash = await argon2.hash(newPassword);

	const query = `
		UPDATE users 
		SET password_hash = ?, updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [passwordHash, id]);

	return { id: Number.parseInt(id, 10) };
};

// ✅ Activer/Désactiver un utilisateur
const toggleActive = async (id, is_active) => {
	const query = `
		UPDATE users 
		SET is_active = ?, updated_at = NOW()
		WHERE id = ?
	`;

	const [result] = await db.execute(query, [is_active, id]);

	if (result.affectedRows === 0) {
		throw new Error("Utilisateur non trouvé");
	}

	return { id: Number.parseInt(id, 10), is_active };
};

// ✅ Supprimer un utilisateur
const remove = async (id) => {
	const query = "DELETE FROM users WHERE id = ?";
	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Utilisateur non trouvé");
	}

	return { id: Number.parseInt(id, 10) };
};

// ✅ Obtenir les statistiques des utilisateurs
const getStats = async () => {
	const query = `
		SELECT 
			COUNT(*) as total,
			COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count,
			COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_count,
			COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
			COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_count
		FROM users
	`;

	const [rows] = await db.execute(query);
	return rows[0];
};

module.exports = {
	create,
	findByEmail,
	findById,
	findAll,
	countAll,
	updateLastLogin,
	verifyPassword,
	update,
	deactivate,
	changePassword,
	toggleActive,
	remove,
	getStats,
};
