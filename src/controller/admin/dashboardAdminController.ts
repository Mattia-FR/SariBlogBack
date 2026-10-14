import type { Request, Response } from "express";
import articlesAdminModel from "../../model/admin/articlesAdminModel";
import imagesAdminModel from "../../model/admin/imagesAdminModel";
import messagesAdminModel from "../../model/admin/messagesAdminModel";
import tagsAdminModel from "../../model/admin/tagsAdminModel";

export const getStats = async (_req: Request, res: Response) => {
	const [
		articlesTotal,
		articlesPublished,
		articlesDrafts,
		imagesTotal,
		imagesInGallery,
		tagsTotal,
		messageCounts,
	] = await Promise.all([
		articlesAdminModel.countAll(),
		articlesAdminModel.countByStatus("published"),
		articlesAdminModel.countByStatus("draft"),
		imagesAdminModel.countAll(),
		imagesAdminModel.countInGallery(),
		tagsAdminModel.countAll(),
		messagesAdminModel.findTabCounts(),
	]);

	res.json({
		articles: {
			total: articlesTotal,
			published: articlesPublished,
			drafts: articlesDrafts,
		},
		images: {
			total: imagesTotal,
			inGallery: imagesInGallery,
		},
		tags: { total: tagsTotal },
		messages: {
			unread: messageCounts.unread,
			read: messageCounts.read,
			archived: messageCounts.archived,
		},
	});
};
