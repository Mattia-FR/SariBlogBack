import express, { type Router } from "express";
import articlesAdminRouter from "./articlesAdminRouter";
import adminMessagesRouter from "./messagesAdminRouter";
import imagesAdminRouter from "./imagesAdminRouter";

const router: Router = express.Router();

// Toutes les routes sont protégées par requireAuth + requireEditor (montage dans router/index.ts)
router.use("/articles", articlesAdminRouter);
router.use("/messages", adminMessagesRouter);
router.use("/images", imagesAdminRouter);

export default router;
