import express, { type Router } from "express";
import * as dashboardAdminController from "../../controller/admin/dashboardAdminController";

const router: Router = express.Router();

router.get("/stats", dashboardAdminController.getStats);

export default router;
