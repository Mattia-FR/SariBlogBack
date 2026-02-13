import express, { type Router } from "express";
import articlesAdminRouter from "./articlesAdminRouter";
import adminMessagesRouter from "./messagesAdminRouter";
import imagesAdminRouter from "./imagesAdminRouter";
import dashboardAdminRouter from "./dashboardAdminRouter";

const router: Router = express.Router();

// Toutes les routes sont protégées par requireAuth + requireEditor (montage dans router/index.ts)
router.use("/articles", articlesAdminRouter);
router.use("/messages", adminMessagesRouter);
router.use("/images", imagesAdminRouter);
router.use("/dashboard", dashboardAdminRouter);

export default router;
