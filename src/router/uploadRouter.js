const express = require("express");
const router = express.Router();

const {
	uploadSingle,
	uploadMultiple,
	deleteImage,
	listImages,
	getImageInfo,
} = require("../controller/uploadController");

const { authenticateToken } = require("../middleware/auth");
const {
	uploadSingle: uploadSingleMiddleware,
	uploadMultiple: uploadMultipleMiddleware,
	handleUploadError,
} = require("../middleware/upload");
const { validateFilename } = require("../middleware/validation");

// ✅ Toutes les routes d'upload nécessitent une authentification
router.use(authenticateToken);

// ✅ Lister toutes les images disponibles
router.get("/", listImages);

// ✅ Obtenir les informations d'une image
router.get("/info/:filename", validateFilename, getImageInfo);

// ✅ Upload d'une image unique
router.post("/single", uploadSingleMiddleware, handleUploadError, uploadSingle);

// ✅ Upload de plusieurs images
router.post(
	"/multiple",
	uploadMultipleMiddleware,
	handleUploadError,
	uploadMultiple,
);

// ✅ Supprimer une image
router.delete("/:filename", validateFilename, deleteImage);

module.exports = router;
