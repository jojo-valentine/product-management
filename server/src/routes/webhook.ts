import { Router, Request, Response } from "express";
import PaymentWebhookController from "../controllers/payment.webhook.controller";
const router = Router();
router.post("/payment", PaymentWebhookController.handleWebhook);
export default router;
