const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

// Créer le dossier uploads s'il n'existe pas
const uploadDir = path.join(__dirname, "../../public/images");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		// Générer un nom unique : timestamp + nom original
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const extension = path.extname(file.originalname);
		const nameWithoutExt = path.basename(file.originalname, extension);
		const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
		cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
	},
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
	// Types MIME autorisés
	const allowedMimes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
	];

	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(
			new Error(
				"Type de fichier non autorisé. Seuls les formats JPEG, PNG, GIF et WebP sont acceptés.",
			),
			false,
		);
	}
};

// Configuration Multer
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB max
		files: 1, // 1 fichier à la fois
	},
});

// Middleware pour upload d'image unique
const uploadSingle = upload.single("image");

// Middleware pour upload de plusieurs images
const uploadMultiple = upload.array("images", 5); // Max 5 images

// Middleware de gestion d'erreurs Multer
const handleUploadError = (err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			return res.status(400).json({
				success: false,
				error: {
					code: "FILE_TOO_LARGE",
					message: "Le fichier est trop volumineux. Taille maximum : 5MB",
				},
			});
		}

		if (err.code === "LIMIT_FILE_COUNT") {
			return res.status(400).json({
				success: false,
				error: {
					code: "TOO_MANY_FILES",
					message: "Trop de fichiers. Maximum : 5 fichiers",
				},
			});
		}

		if (err.code === "LIMIT_UNEXPECTED_FILE") {
			return res.status(400).json({
				success: false,
				error: {
					code: "UNEXPECTED_FILE",
					message: "Champ de fichier inattendu",
				},
			});
		}
	}

	if (err.message.includes("Type de fichier non autorisé")) {
		return res.status(400).json({
			success: false,
			error: {
				code: "INVALID_FILE_TYPE",
				message: err.message,
			},
		});
	}

	next(err);
};

module.exports = {
	uploadSingle,
	uploadMultiple,
	handleUploadError,
};
