const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

// Middleware de vérification du token JWT
const authenticateToken = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (!token) {
			return res.status(401).json({
				success: false,
				error: {
					code: "NO_TOKEN",
					message: "Token d'accès requis",
				},
			});
		}

		// Vérifier le token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Récupérer l'utilisateur
		const user = await userModel.findById(decoded.userId);

		if (!user) {
			return res.status(401).json({
				success: false,
				error: {
					code: "INVALID_TOKEN",
					message: "Token invalide",
				},
			});
		}

		// Ajouter l'utilisateur à la requête
		req.user = user;
		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return res.status(401).json({
				success: false,
				error: {
					code: "INVALID_TOKEN",
					message: "Token invalide",
				},
			});
		}

		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				success: false,
				error: {
					code: "TOKEN_EXPIRED",
					message: "Token expiré",
				},
			});
		}

		console.error("Erreur d'authentification:", error);
		res.status(500).json({
			success: false,
			error: {
				code: "AUTH_ERROR",
				message: "Erreur d'authentification",
			},
		});
	}
};

// Middleware de vérification des rôles
const requireRole = (roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				error: {
					code: "NO_USER",
					message: "Utilisateur non authentifié",
				},
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				error: {
					code: "INSUFFICIENT_PERMISSIONS",
					message: "Permissions insuffisantes",
				},
			});
		}

		next();
	};
};

module.exports = {
	authenticateToken,
	requireRole,
};
