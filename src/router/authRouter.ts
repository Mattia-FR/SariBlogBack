import express, { type Router } from "express";
import { login, logout, refresh, signup } from "../controller/authController";
import { loginLimiter, signupLimiter } from "../config/rateLimit";
import { validate } from "../middleware/validateMiddleware";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

const router: Router = express.Router();

router.post("/login", validate(loginSchema), loginLimiter, login);
router.post("/signup", validate(registerSchema), signupLimiter, signup);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
