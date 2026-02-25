import express, { type Router } from "express";
import { browseAll } from "../controller/categoriesController";

const router: Router = express.Router();

router.get("/", browseAll);

export default router;
