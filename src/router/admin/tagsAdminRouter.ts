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
import { validate } from "../../middleware/validateMiddleware";
import { tagCreateSchema, tagUpdateSchema } from "../../schemas/tagSchemas";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/used-on-articles", browseUsedOnArticles);
router.get("/used-on-images", browseUsedOnImages);
router.get("/:id", readById);
router.post("/", validate(tagCreateSchema), add);
router.patch("/:id", validate(tagUpdateSchema), edit);
router.delete("/:id", destroy);

export default router;
