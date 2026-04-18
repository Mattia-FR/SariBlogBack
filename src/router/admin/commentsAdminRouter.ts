import express, { type Router } from "express";
import {
	browseAll,
	destroy,
	editStatus,
	readById,
} from "../../controller/admin/commentsAdminController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.patch("/:id/status", editStatus);
router.delete("/:id", destroy);

export default router;
