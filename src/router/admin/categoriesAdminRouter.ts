import express, { type Router } from "express";
import {
	add,
	destroy,
	edit,
	readById,
} from "../../controller/admin/categoriesAdminController";
import { browseAll } from "../../controller/categoriesController";
import { validate } from "../../middleware/validateMiddleware";
import {
	categoryCreateSchema,
	categoryUpdateSchema,
} from "../../schemas/categorySchemas";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.post("/", validate(categoryCreateSchema), add);
router.patch("/:id", validate(categoryUpdateSchema), edit);
router.delete("/:id", destroy);

export default router;
