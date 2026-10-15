import express, { type Router } from "express";
import {
	browseAll,
	destroy,
	editStatus,
	readById,
} from "../../controller/admin/messagesAdminController";
import { validate } from "../../middleware/validateMiddleware";
import { messageUpdateStatusSchema } from "../../schemas/messageSchemas";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.patch("/:id/status", validate(messageUpdateStatusSchema), editStatus);
router.delete("/:id", destroy);

export default router;
