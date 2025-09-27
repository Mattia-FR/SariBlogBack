const adminAboutModel = require("../model/adminAboutModel");

// ✅ Récupérer le contenu "À propos" (admin)
const read = async (req, res) => {
	try {
		const about = await adminAboutModel.findAbout();

		if (!about) {
			return res.error("Contenu 'À propos' non trouvé", 404);
		}

		res.success({ about });
	} catch (error) {
		console.error("Erreur read admin about:", error);
		res.error("Erreur lors de la récupération du contenu 'À propos'", 500);
	}
};

// ✅ Modifier le contenu "À propos"
const update = async (req, res) => {
	try {
		const { content, image } = req.body;

		const updatedAbout = await adminAboutModel.update({
			content,
			image
		});

		res.success({ about: updatedAbout }, "Contenu 'À propos' modifié avec succès");
	} catch (error) {
		console.error("Erreur update about:", error);
		res.error("Erreur lors de la modification du contenu 'À propos'", 500);
	}
};

// ✅ Mettre à jour seulement le contenu
const updateContent = async (req, res) => {
	try {
		const { content } = req.body;

		const updatedAbout = await adminAboutModel.updateContent(content);

		res.success({ about: updatedAbout }, "Contenu modifié avec succès");
	} catch (error) {
		console.error("Erreur update content about:", error);
		
		if (error.message === "Aucun contenu 'À propos' trouvé") {
			return res.error("Aucun contenu 'À propos' trouvé", 404);
		}
		
		res.error("Erreur lors de la modification du contenu", 500);
	}
};

// ✅ Mettre à jour seulement l'image
const updateImage = async (req, res) => {
	try {
		const { image } = req.body;

		const updatedAbout = await adminAboutModel.updateImage(image);

		res.success({ about: updatedAbout }, "Image modifiée avec succès");
	} catch (error) {
		console.error("Erreur update image about:", error);
		
		if (error.message === "Aucun contenu 'À propos' trouvé") {
			return res.error("Aucun contenu 'À propos' trouvé", 404);
		}
		
		res.error("Erreur lors de la modification de l'image", 500);
	}
};

// ✅ Obtenir l'historique des modifications
const getHistory = async (req, res) => {
	try {
		const history = await adminAboutModel.getHistory();
		res.success({ history });
	} catch (error) {
		console.error("Erreur get history about:", error);
		res.error("Erreur lors de la récupération de l'historique", 500);
	}
};

module.exports = {
	read,
	update,
	updateContent,
	updateImage,
	getHistory
};