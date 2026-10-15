import express, { type Router } from "express";
import {
	browseAll,
	destroy,
	editStatus,
	readById,
} from "../../controller/admin/commentsAdminController";
import { validate } from "../../middleware/validateMiddleware";
import { commentUpdateStatusSchema } from "../../schemas/commentSchemas";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:id", readById);
router.patch("/:id/status", validate(commentUpdateStatusSchema), editStatus);
router.delete("/:id", destroy);

export default router;
