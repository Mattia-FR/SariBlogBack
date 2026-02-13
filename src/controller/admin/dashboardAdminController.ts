import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import imagesAdminModel from "../../model/admin/imagesAdminModel";
import messagesAdminModel from "../../model/admin/messagesAdminModel";
import tagsAdminModel from "../../model/admin/tagsAdminModel";

export const getStats = async (req: Request, res: Response) => {
	try {
		const stats = {
			articles: {
				total: await articlesAdminModel.countAll(),
				published: await articlesAdminModel.countByStatus("published"),
				drafts: await articlesAdminModel.countByStatus("draft"),
			},
			images: {
				total: await imagesAdminModel.countAll(),
				inGallery: await imagesAdminModel.countInGallery(),
			},
			tags: {
				total: await tagsAdminModel.countAll(),
			},
			messages: {
				unread: await messagesAdminModel.countByStatus("unread"),
				read: await messagesAdminModel.countByStatus("read"),
				archived: await messagesAdminModel.countByStatus("archived"),
			},
		};

		res.json(stats);
	} catch (error) {
		console.error("Erreur récupération stats dashboard:", error);
		res.status(500).json({ message: "Erreur serveur" });
	}
};
