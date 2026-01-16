import express, { type Router } from "express";
import articlesRouter from "./articlesRouter";
import imagesRouter from "./imagesRouter";
import usersRouter from "./usersRouter";
import tagsRouter from "./tagsRouter";
import commentsRouter from "./commentsRouter";
import messagesRouter from "./messagesRouter";
import authRouter from "./authRouter";

const router: Router = express.Router();

router.use("/articles", articlesRouter);
router.use("/images", imagesRouter);
router.use("/users", usersRouter);
router.use("/tags", tagsRouter);
router.use("/comments", commentsRouter);
router.use("/messages", messagesRouter);
router.use("/auth", authRouter);

export default router;
