import express, { type Router } from "express";
import articlesAdminRouter from "./articlesAdminRouter";
import messagesAdminRouter from "./messagesAdminRouter";
import imagesAdminRouter from "./imagesAdminRouter";
import dashboardAdminRouter from "./dashboardAdminRouter";
import commentsAdminRouter from "./commentsAdminRouter";
import tagsAdminRouter from "./tagsAdminRouter";
import categoriesAdminRouter from "./categoriesAdminRouter";
import usersAdminRouter from "./usersAdminRouter";

const router: Router = express.Router();

// Toutes les routes sont protégées par requireAuth + requireEditor (montage dans router/index.ts)
router.use("/articles", articlesAdminRouter);
router.use("/images", imagesAdminRouter);
router.use("/messages", messagesAdminRouter);
router.use("/comments", commentsAdminRouter);
router.use("/dashboard", dashboardAdminRouter);
router.use("/tags", tagsAdminRouter);
router.use("/categories", categoriesAdminRouter);
router.use("/users", usersAdminRouter);

export default router;
