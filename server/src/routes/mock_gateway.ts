// MockGateway
import { Router, Request, Response } from "express";
import mockGatewayController from "../controllers/mockGatewayController";

const router = Router();
router.post("/pay", mockGatewayController.mockPay);
router.post("/retry/:eventId", mockGatewayController.retryWebhook);
// router.post("pay");
export default router;
