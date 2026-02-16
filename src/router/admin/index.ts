import express, { type Router } from "express";
import articlesAdminRouter from "./articlesAdminRouter";
import messagesAdminRouter from "./messagesAdminRouter";
import imagesAdminRouter from "./imagesAdminRouter";
import dashboardAdminRouter from "./dashboardAdminRouter";
import commentsAdminRouter from "./commentsAdminRouter";

const router: Router = express.Router();

// Toutes les routes sont protégées par requireAuth + requireEditor (montage dans router/index.ts)
router.use("/articles", articlesAdminRouter);
router.use("/images", imagesAdminRouter);
router.use("/messages", messagesAdminRouter);
router.use("/comments", commentsAdminRouter);
router.use("/dashboard", dashboardAdminRouter);

export default router;
