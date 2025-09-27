const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

// Connexion
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Trouver l'utilisateur
		const user = await userModel.findByEmail(email);

		if (!user) {
			return res.status(401).json({
				success: false,
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Email ou mot de passe incorrect",
				},
			});
		}

		// Vérifier le mot de passe
		const isValidPassword = await userModel.verifyPassword(
			password,
			user.password_hash,
		);

		if (!isValidPassword) {
			return res.status(401).json({
				success: false,
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Email ou mot de passe incorrect",
				},
			});
		}

		// Générer le token JWT
		const token = jwt.sign(
			{
				userId: user.id,
				email: user.email,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "24h" },
		);

		// Mettre à jour la dernière connexion
		await userModel.updateLastLogin(user.id);

		// Retourner les données (sans le hash du mot de passe)
		const { password_hash, ...userWithoutPassword } = user;

		res.success(
			{
				user: userWithoutPassword,
				token,
			},
			"Connexion réussie",
		);
	} catch (error) {
		console.error("Erreur de connexion:", error);
		res.error("Erreur lors de la connexion", 500);
	}
};

// Vérifier le token (pour vérifier si l'utilisateur est connecté)
const verifyToken = async (req, res) => {
	try {
		// Si on arrive ici, c'est que le middleware authenticateToken a validé le token
		const { password_hash, ...userWithoutPassword } = req.user;

		res.success(
			{
				user: userWithoutPassword,
			},
			"Token valide",
		);
	} catch (error) {
		console.error("Erreur de vérification du token:", error);
		res.error("Erreur lors de la vérification du token", 500);
	}
};

// Déconnexion (côté client principalement)
const logout = async (req, res) => {
	try {
		res.success(null, "Déconnexion réussie");
	} catch (error) {
		console.error("Erreur de déconnexion:", error);
		res.error("Erreur lors de la déconnexion", 500);
	}
};

module.exports = {
	login,
	verifyToken,
	logout,
};
