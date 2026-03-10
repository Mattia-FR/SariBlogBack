import express, { type Router } from "express";
import { browseAll, getBySlug } from "../controller/categoriesController";

const router: Router = express.Router();

router.get("/", browseAll);
router.get("/:slug", getBySlug);

export default router;
