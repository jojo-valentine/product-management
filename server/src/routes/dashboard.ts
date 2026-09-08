import { Router, Request, Response } from "express";
import dashboardController from "../controllers/dashboardController";
const router = Router();

router.get(`/stats`, dashboardController.dashboardStats);
export default router;
