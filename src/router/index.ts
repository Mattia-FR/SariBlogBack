import express, { type Router } from "express";
import articlesRouter from "./articlesRouter";
import imagesRouter from "./imagesRouter";
import usersRouter from "./usersRouter";
import tagsRouter from "./tagsRouter";
import commentsRouter from "./commentsRouter";

const router: Router = express.Router();

router.use("/articles", articlesRouter);
router.use("/images", imagesRouter);
router.use("/users", usersRouter);
router.use("/tags", tagsRouter);
router.use("/comments", commentsRouter);

export default router;
