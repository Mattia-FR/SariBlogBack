import express, { type Router } from "express";
import {
	add,
	destroy,
	edit,
	readById,
} from "../../controller/admin/categoriesAdminController";
import { browseAll } from "../../controller/categoriesController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.post("/", add);
router.patch("/:id", edit);
router.delete("/:id", destroy);

export default router;
