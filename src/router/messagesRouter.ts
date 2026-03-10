import express, { type Router } from "express";
import { add } from "../controller/messagesController";
import { messagesLimiter } from "../config/rateLimit";
import { messageVisitorSchema } from "../schemas/messageSchemas";
import { validate } from "../middleware/validateMiddleware";

const router: Router = express.Router();

router.post("/", messagesLimiter, validate(messageVisitorSchema), add);

export default router;
