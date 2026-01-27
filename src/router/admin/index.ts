import express, { type Router } from "express";
import articlesAdminRouter from "./articlesAdminRouter";

const router: Router = express.Router();

router.use("/articles", articlesAdminRouter);

// Plus tard tu ajouteras :
// router.use("/messages", adminMessagesRouter);
// router.use("/images", adminImagesRouter);
// router.use("/users", adminUsersRouter);

export default router;
