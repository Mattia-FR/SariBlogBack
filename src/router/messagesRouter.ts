import express, {
	type NextFunction,
	type Request,
	type Response,
	type Router,
} from "express";
import { add } from "../controller/messagesController";
import { optionalAuth } from "../middleware/authMiddleware";
import { messagesLimiter } from "../config/rateLimit";
import {
	messageVisitorSchema,
	messageConnectedSchema,
} from "../schemas/messageSchemas";

const router: Router = express.Router();

// Validation adaptée au cas : connecté (subject + text) ou visiteur (firstname, lastname, email, subject, text)
function validateMessage(req: Request, _res: Response, next: NextFunction) {
	const schema = req.user ? messageConnectedSchema : messageVisitorSchema;
	try {
		req.body = schema.parse(req.body);
		next();
	} catch (err) {
		next(err);
	}
}

// Route publique pour créer un message (formulaire de contact)
// optionalAuth en premier pour choisir le bon schéma (connecté vs visiteur)
router.post("/", messagesLimiter, optionalAuth, validateMessage, add);

export default router;
