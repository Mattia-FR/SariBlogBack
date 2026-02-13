import express from "express";
import * as dashboardAdminController from "../../controller/admin/dashboardAdminController";

const router = express.Router();

router.get("/stats", dashboardAdminController.getStats);

export default router;
