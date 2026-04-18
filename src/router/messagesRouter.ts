import express, { type Router } from "express";
import { messagesLimiter } from "../config/rateLimit";
import { add } from "../controller/messagesController";
import { validate } from "../middleware/validateMiddleware";
import { messageVisitorSchema } from "../schemas/messageSchemas";

const router: Router = express.Router();

router.post("/", validate(messageVisitorSchema), messagesLimiter, add);

export default router;
