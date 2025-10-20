const path = require("node:path");
const fs = require("node:fs");

// ✅ Upload d'une image unique
const uploadSingle = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				error: {
					code: "NO_FILE",
					message: "Aucun fichier fourni",
				},
			});
		}

		const fileInfo = {
			filename: req.file.filename,
			originalName: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: `/images/${req.file.filename}`,
			uploadedAt: new Date().toISOString(),
		};

		res.success(
			{
				file: fileInfo,
			},
			"Image uploadée avec succès",
		);
	} catch (error) {
		console.error("Erreur upload single:", error);
		res.error("Erreur lors de l'upload de l'image", 500);
	}
};

// ✅ Upload de plusieurs images
const uploadMultiple = async (req, res) => {
	try {
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({
				success: false,
				error: {
					code: "NO_FILES",
					message: "Aucun fichier fourni",
				},
			});
		}

		const filesInfo = req.files.map((file) => ({
			filename: file.filename,
			originalName: file.originalname,
			mimetype: file.mimetype,
			size: file.size,
			path: `/images/${file.filename}`,
			uploadedAt: new Date().toISOString(),
		}));

		res.success(
			{
				files: filesInfo,
				count: filesInfo.length,
			},
			`${filesInfo.length} image(s) uploadée(s) avec succès`,
		);
	} catch (error) {
		console.error("Erreur upload multiple:", error);
		res.error("Erreur lors de l'upload des images", 500);
	}
};

// ✅ Supprimer une image
const deleteImage = async (req, res) => {
	try {
		const { filename } = req.params;

		// Sécuriser le nom de fichier (éviter les path traversal)
		const safeFilename = path.basename(filename);
		const filePath = path.join(__dirname, "../../public/images", safeFilename);

		// Vérifier que le fichier existe
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({
				success: false,
				error: {
					code: "FILE_NOT_FOUND",
					message: "Fichier non trouvé",
				},
			});
		}

		// Supprimer le fichier
		fs.unlinkSync(filePath);

		res.success(
			{
				filename: safeFilename,
			},
			"Image supprimée avec succès",
		);
	} catch (error) {
		console.error("Erreur delete image:", error);
		res.error("Erreur lors de la suppression de l'image", 500);
	}
};

// ✅ Lister les images disponibles
const listImages = async (req, res) => {
	try {
		const imagesDir = path.join(__dirname, "../../public/images");

		if (!fs.existsSync(imagesDir)) {
			return res.success({ images: [] });
		}

		const files = fs.readdirSync(imagesDir);
		const images = files
			.filter((file) => {
				const ext = path.extname(file).toLowerCase();
				return [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext);
			})
			.map((file) => {
				const filePath = path.join(imagesDir, file);
				const stats = fs.statSync(filePath);

				return {
					filename: file,
					path: `/images/${file}`,
					size: stats.size,
					createdAt: stats.birthtime.toISOString(),
					modifiedAt: stats.mtime.toISOString(),
				};
			})
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		res.success({
			images,
			count: images.length,
		});
	} catch (error) {
		console.error("Erreur list images:", error);
		res.error("Erreur lors de la récupération des images", 500);
	}
};

// ✅ Obtenir les informations d'une image
const getImageInfo = async (req, res) => {
	try {
		const { filename } = req.params;

		// Sécuriser le nom de fichier
		const safeFilename = path.basename(filename);
		const filePath = path.join(__dirname, "../../public/images", safeFilename);

		// Vérifier que le fichier existe
		if (!fs.existsSync(filePath)) {
			return res.status(404).json({
				success: false,
				error: {
					code: "FILE_NOT_FOUND",
					message: "Fichier non trouvé",
				},
			});
		}

		const stats = fs.statSync(filePath);
		const ext = path.extname(safeFilename).toLowerCase();

		const imageInfo = {
			filename: safeFilename,
			path: `/images/${safeFilename}`,
			size: stats.size,
			extension: ext,
			createdAt: stats.birthtime.toISOString(),
			modifiedAt: stats.mtime.toISOString(),
		};

		res.success({ image: imageInfo });
	} catch (error) {
		console.error("Erreur get image info:", error);
		res.error(
			"Erreur lors de la récupération des informations de l'image",
			500,
		);
	}
};

module.exports = {
	uploadSingle,
	uploadMultiple,
	deleteImage,
	listImages,
	getImageInfo,
};
