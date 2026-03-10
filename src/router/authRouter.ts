import express, { type Router } from "express";
import { login, logout, refresh } from "../controller/authController";
import { loginLimiter } from "../config/rateLimit";
import { validate } from "../middleware/validateMiddleware";
import { loginSchema } from "../schemas/authSchemas";

const router: Router = express.Router();

router.post("/login", validate(loginSchema), loginLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
