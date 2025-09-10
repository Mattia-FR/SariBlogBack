const contactModel = require("../model/contactModel");

// ✅ Envoyer un message de contact
const sendMessage = async (req, res) => {
	try {
		const { name, email, subject, message } = req.body;
		const senderIp = req.ip;

		const newMessage = await contactModel.create({
			name,
			email,
			subject,
			message,
			senderIp,
		});

		res.success({ message: newMessage }, "Message envoyé avec succès");
	} catch (error) {
		console.error("Erreur sendMessage:", error);
		res.error("Erreur lors de l'envoi du message", 500);
	}
};

module.exports = {
	sendMessage,
};
