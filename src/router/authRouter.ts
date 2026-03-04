import express, { type Router } from "express";
import { login, logout, refresh, signup } from "../controller/authController";
import { loginLimiter, signupLimiter } from "../config/rateLimit";

const router: Router = express.Router();

router.post("/login", loginLimiter, login);
router.post("/signup", signupLimiter, signup);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
