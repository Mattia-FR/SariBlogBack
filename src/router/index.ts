import express, { type Router } from "express";
import articlesRouter from "./articlesRouter";
import imagesRouter from "./imagesRouter";
import usersRouter from "./usersRouter";

const router: Router = express.Router();

router.use("/articles", articlesRouter);
router.use("/images", imagesRouter);
router.use("/users", usersRouter);

export default router;
