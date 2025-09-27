const db = require("./db");
const argon2 = require("argon2");

// Créer un nouvel utilisateur
const create = async ({ username, email, password, role = "editor" }) => {
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

// Trouver un utilisateur par email
const findByEmail = async (email) => {
	const query = `
		SELECT id, username, email, password_hash, role, is_active, last_login, created_at
		FROM users 
		WHERE email = ? AND is_active = TRUE
	`;

	const [rows] = await db.execute(query, [email]);
	return rows[0] || null;
};

// Trouver un utilisateur par ID
const findById = async (id) => {
	const query = `
		SELECT id, username, email, role, is_active, last_login, created_at
		FROM users 
		WHERE id = ? AND is_active = TRUE
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// Mettre à jour la dernière connexion
const updateLastLogin = async (id) => {
	const query = `
		UPDATE users 
		SET last_login = NOW() 
		WHERE id = ?
	`;

	await db.execute(query, [id]);
};

// Vérifier le mot de passe
const verifyPassword = async (password, hash) => {
	return await argon2.verify(hash, password);
};

// ✅ Lister tous les utilisateurs avec pagination (admin)
const findAll = async (limit, offset) => {
	const query = `
		SELECT 
			id,
			username,
			email,
			role,
			is_active,
			DATE_FORMAT(last_login, '%d/%m/%Y à %H:%i') as last_login,
			DATE_FORMAT(created_at, '%d/%m/%Y') as created_at,
			DATE_FORMAT(updated_at, '%d/%m/%Y') as updated_at
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

// ✅ Trouver un utilisateur par ID (admin - inclut les inactifs)
const findByIdAdmin = async (id) => {
	const query = `
		SELECT 
			id, 
			username, 
			email, 
			role, 
			is_active, 
			DATE_FORMAT(last_login, '%d/%m/%Y à %H:%i') as last_login,
			DATE_FORMAT(created_at, '%d/%m/%Y') as created_at,
			DATE_FORMAT(updated_at, '%d/%m/%Y') as updated_at
		FROM users 
		WHERE id = ?
	`;

	const [rows] = await db.execute(query, [id]);
	return rows[0] || null;
};

// ✅ Modifier un utilisateur
const update = async (id, { username, email, role, is_active }) => {
	// Récupérer l'utilisateur existant
	const existingUser = await findByIdAdmin(id);
	if (!existingUser) {
		throw new Error("Utilisateur non trouvé");
	}

	// Vérifier l'unicité de l'email si modifié
	if (email && email !== existingUser.email) {
		const existingEmail = await findByEmail(email);
		if (existingEmail) {
			throw new Error("Un utilisateur avec cet email existe déjà");
		}
	}

	// Vérifier l'unicité du username si modifié
	if (username && username !== existingUser.username) {
		const existingUsername = await findByUsername(username);
		if (existingUsername) {
			throw new Error("Un utilisateur avec ce nom d'utilisateur existe déjà");
		}
	}

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

	return await findByIdAdmin(id);
};

// ✅ Supprimer un utilisateur (désactiver)
const remove = async (id) => {
	// Vérifier que l'utilisateur existe
	const existingUser = await findByIdAdmin(id);
	if (!existingUser) {
		throw new Error("Utilisateur non trouvé");
	}

	const query =
		"UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?";
	const [result] = await db.execute(query, [id]);

	if (result.affectedRows === 0) {
		throw new Error("Utilisateur non trouvé");
	}

	return { id: Number.parseInt(id, 10), is_active: false };
};

// ✅ Changer le mot de passe d'un utilisateur
const changePassword = async (id, newPassword) => {
	const passwordHash = await argon2.hash(newPassword);

	const query = `
		UPDATE users 
		SET password_hash = ?, updated_at = NOW()
		WHERE id = ?
	`;

	const [result] = await db.execute(query, [passwordHash, id]);

	if (result.affectedRows === 0) {
		throw new Error("Utilisateur non trouvé");
	}

	return { id: Number.parseInt(id, 10) };
};

// ✅ Activer/désactiver un utilisateur
const toggleActive = async (id) => {
	const existingUser = await findByIdAdmin(id);
	if (!existingUser) {
		throw new Error("Utilisateur non trouvé");
	}

	const newStatus = !existingUser.is_active;

	const query = `
		UPDATE users 
		SET is_active = ?, updated_at = NOW()
		WHERE id = ?
	`;

	await db.execute(query, [newStatus, id]);

	return {
		id: Number.parseInt(id, 10),
		is_active: newStatus,
		message: `Utilisateur ${newStatus ? "activé" : "désactivé"} avec succès`,
	};
};

// ✅ Trouver un utilisateur par username (pour vérification d'unicité)
const findByUsername = async (username) => {
	const query = "SELECT id, username FROM users WHERE username = ?";
	const [rows] = await db.execute(query, [username]);
	return rows[0] || null;
};

// ✅ Obtenir les statistiques des utilisateurs
const getStats = async () => {
	const query = `
		SELECT 
			COUNT(*) as total_users,
			COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_users,
			COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive_users,
			COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
			COUNT(CASE WHEN role = 'editor' THEN 1 END) as editor_users,
			COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_logins
		FROM users
	`;

	const [rows] = await db.execute(query);
	return rows[0];
};

module.exports = {
	create,
	findByEmail,
	findById,
	updateLastLogin,
	verifyPassword,
	// Nouvelles fonctions admin
	findAll,
	countAll,
	findByIdAdmin,
	update,
	remove,
	changePassword,
	toggleActive,
	findByUsername,
	getStats,
};
