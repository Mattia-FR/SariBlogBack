const adminMessagesModel = require("../model/adminMessagesModel");

// ✅ Lister tous les messages (admin)
const browse = async (req, res) => {
	try {
		const { limit, offset } = req.query;

		const [messages, totalCount, unreadCount] = await Promise.all([
			adminMessagesModel.findAll(limit, offset),
			adminMessagesModel.countAll(),
			adminMessagesModel.countUnread(),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		res.success({
			messages,
			pagination: {
				limit,
				offset,
				totalCount,
				totalPages,
			},
			stats: {
				unreadCount
			}
		});
	} catch (error) {
		console.error("Erreur browse admin messages:", error);
		res.error("Erreur lors de la récupération des messages", 500);
	}
};

// ✅ Récupérer un message par ID (admin)
const read = async (req, res) => {
	try {
		const { id } = req.params;
		const message = await adminMessagesModel.findById(id);

		if (!message) {
			return res.error("Message non trouvé", 404);
		}

		res.success({ message });
	} catch (error) {
		console.error("Erreur read admin message:", error);
		res.error("Erreur lors de la récupération du message", 500);
	}
};

// ✅ Marquer un message comme lu
const markAsRead = async (req, res) => {
	try {
		const { id } = req.params;
		
		const updatedMessage = await adminMessagesModel.markAsRead(id);

		res.success({ message: updatedMessage }, "Message marqué comme lu");
	} catch (error) {
		console.error("Erreur markAsRead message:", error);
		
		if (error.message === "Message non trouvé") {
			return res.error("Message non trouvé", 404);
		}
		
		res.error("Erreur lors du marquage du message", 500);
	}
};

// ✅ Marquer un message comme non lu
const markAsUnread = async (req, res) => {
	try {
		const { id } = req.params;
		
		const updatedMessage = await adminMessagesModel.markAsUnread(id);

		res.success({ message: updatedMessage }, "Message marqué comme non lu");
	} catch (error) {
		console.error("Erreur markAsUnread message:", error);
		
		if (error.message === "Message non trouvé") {
			return res.error("Message non trouvé", 404);
		}
		
		res.error("Erreur lors du marquage du message", 500);
	}
};

// ✅ Marquer tous les messages comme lus
const markAllAsRead = async (req, res) => {
	try {
		const result = await adminMessagesModel.markAllAsRead();

		res.success({ result }, result.message);
	} catch (error) {
		console.error("Erreur markAllAsRead messages:", error);
		res.error("Erreur lors du marquage des messages", 500);
	}
};

// ✅ Supprimer un message
const remove = async (req, res) => {
	try {
		const { id } = req.params;
		
		const deletedMessage = await adminMessagesModel.remove(id);

		res.success({ message: deletedMessage }, "Message supprimé avec succès");
	} catch (error) {
		console.error("Erreur delete message:", error);
		
		if (error.message === "Message non trouvé") {
			return res.error("Message non trouvé", 404);
		}
		
		res.error("Erreur lors de la suppression du message", 500);
	}
};

// ✅ Supprimer tous les messages lus
const removeAllRead = async (req, res) => {
	try {
		const result = await adminMessagesModel.removeAllRead();

		res.success({ result }, result.message);
	} catch (error) {
		console.error("Erreur removeAllRead messages:", error);
		res.error("Erreur lors de la suppression des messages", 500);
	}
};

// ✅ Obtenir les statistiques des messages
const getStats = async (req, res) => {
	try {
		const stats = await adminMessagesModel.getStats();
		res.success({ stats });
	} catch (error) {
		console.error("Erreur get stats messages:", error);
		res.error("Erreur lors de la récupération des statistiques", 500);
	}
};

module.exports = {
	browse,
	read,
	markAsRead,
	markAsUnread,
	markAllAsRead,
	remove,
	removeAllRead,
	getStats
};