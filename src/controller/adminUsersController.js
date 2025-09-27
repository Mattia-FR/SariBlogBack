const userModel = require("../model/userModel");

// ✅ Lister tous les utilisateurs (admin)
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [users, totalCount] = await Promise.all([
			userModel.findAll(limit, offset),
			userModel.countAll(),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.success({
			users,
			pagination: {
				limit,
				offset,
				totalCount,
				totalPages,
			},
		});
	} catch (error) {
		console.error("Erreur browse admin users:", error);
		res.error("Erreur lors de la récupération des utilisateurs", 500);
	}
};

// ✅ Récupérer un utilisateur par ID (admin)
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await userModel.findByIdAdmin(id);

		if (!user) {
			return res.error("Utilisateur non trouvé", 404);
		}

		res.success({ user });
	} catch (error) {
		console.error("Erreur read admin user:", error);
		res.error("Erreur lors de la récupération de l'utilisateur", 500);
	}
};

// ✅ Créer un nouvel utilisateur
const create = async (req, res) => {
	try {
		const { username, email, password, role = "editor" } = req.body;

		const newUser = await userModel.create({
			username,
			email,
			password,
			role,
		});

		res.success({ user: newUser }, "Utilisateur créé avec succès");
	} catch (error) {
		console.error("Erreur create user:", error);

		if (error.message.includes("existe déjà")) {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_USER",
					message: error.message,
				},
			});
		}

		res.error("Erreur lors de la création de l'utilisateur", 500);
	}
};

// ✅ Modifier un utilisateur
const update = async (req, res) => {
	try {
		const { id } = req.params;
		const { username, email, role, is_active } = req.body;

		const updatedUser = await userModel.update(id, {
			username,
			email,
			role,
			is_active,
		});

		res.success({ user: updatedUser }, "Utilisateur modifié avec succès");
	} catch (error) {
		console.error("Erreur update user:", error);

		if (error.message === "Utilisateur non trouvé") {
			return res.error("Utilisateur non trouvé", 404);
		}

		if (error.message.includes("existe déjà")) {
			return res.status(409).json({
				success: false,
				error: {
					code: "DUPLICATE_USER",
					message: error.message,
				},
			});
		}

		res.error("Erreur lors de la modification de l'utilisateur", 500);
	}
};

// ✅ Supprimer un utilisateur (désactiver)
const remove = async (req, res) => {
	try {
		const { id } = req.params;

		// Empêcher l'auto-suppression
		if (Number.parseInt(id, 10) === req.user.id) {
			return res.status(403).json({
				success: false,
				error: {
					code: "SELF_DELETE_FORBIDDEN",
					message: "Vous ne pouvez pas supprimer votre propre compte",
				},
			});
		}

		const deletedUser = await userModel.remove(id);

		res.success({ user: deletedUser }, "Utilisateur supprimé avec succès");
	} catch (error) {
		console.error("Erreur delete user:", error);

		if (error.message === "Utilisateur non trouvé") {
			return res.error("Utilisateur non trouvé", 404);
		}

		res.error("Erreur lors de la suppression de l'utilisateur", 500);
	}
};

// ✅ Changer le mot de passe d'un utilisateur
const changePassword = async (req, res) => {
	try {
		const { id } = req.params;
		const { newPassword } = req.body;

		const updatedUser = await userModel.changePassword(id, newPassword);

		res.success({ user: updatedUser }, "Mot de passe modifié avec succès");
	} catch (error) {
		console.error("Erreur change password:", error);

		if (error.message === "Utilisateur non trouvé") {
			return res.error("Utilisateur non trouvé", 404);
		}

		res.error("Erreur lors du changement de mot de passe", 500);
	}
};

// ✅ Activer/désactiver un utilisateur
const toggleActive = async (req, res) => {
	try {
		const { id } = req.params;

		// Empêcher l'auto-désactivation
		if (Number.parseInt(id, 10) === req.user.id) {
			return res.status(403).json({
				success: false,
				error: {
					code: "SELF_DEACTIVATE_FORBIDDEN",
					message: "Vous ne pouvez pas désactiver votre propre compte",
				},
			});
		}

		const result = await userModel.toggleActive(id);

		res.success({ result }, result.message);
	} catch (error) {
		console.error("Erreur toggle active user:", error);

		if (error.message === "Utilisateur non trouvé") {
			return res.error("Utilisateur non trouvé", 404);
		}

		res.error("Erreur lors du changement de statut", 500);
	}
};

// ✅ Obtenir les statistiques des utilisateurs
const getStats = async (req, res) => {
	try {
		const stats = await userModel.getStats();
		res.success({ stats });
	} catch (error) {
		console.error("Erreur get stats users:", error);
		res.error("Erreur lors de la récupération des statistiques", 500);
	}
};

module.exports = {
	browse,
	read,
	create,
	update,
	remove,
	changePassword,
	toggleActive,
	getStats,
};
