import express, { type Router } from "express";
import {
	browseAll,
	readById,
	add,
	edit,
	destroy,
} from "../../controller/admin/categoriesAdminController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.post("/", add);
router.patch("/:id", edit);
router.delete("/:id", destroy);

export default router;
