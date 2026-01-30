import express, { type Router } from "express";
import {
	browseAll,
	browseByStatus,
	readById,
	editStatus,
	destroy,
} from "../../controller/admin/messagesAdminController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/status/:status", browseByStatus);
router.get("/:id", readById);
router.patch("/:id/status", editStatus);
router.delete("/:id", destroy);

export default router;
