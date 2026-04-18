import express, { type Router } from "express";
import {
	add,
	browseAll,
	browseUsedOnArticles,
	browseUsedOnImages,
	destroy,
	edit,
	readById,
} from "../../controller/admin/tagsAdminController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/used-on-articles", browseUsedOnArticles);
router.get("/used-on-images", browseUsedOnImages);
router.get("/:id", readById);
router.post("/", add);
router.patch("/:id", edit);
router.delete("/:id", destroy);

export default router;
