import { Request, Response } from "express";
import logger from "../config/logger";
import Payment from "../models/Payment";
import axios from "axios";
import crypto from "node:crypto";

type MockWebhookEvent = {
  eventId: string;
  eventType: string;
  paymentUuid: string;
  gatewayTransactionId: string;
  amount: number;
  currency: string;
};

const mockWebhookEvents = new Map<
  string,
  {
    event: MockWebhookEvent;
    payload: string;
    signature: string;
  }
>();

class mockGatewayController {
  static async mockPay(req: Request, res: Response) {
    try {
      const { paymentUuid, result } = req.body;

      // 1. Validate request
      if (!paymentUuid || !["success", "failed"].includes(result)) {
        return res.status(400).json({
          message: "Invalid payment request",
        });
      }

      // 2. Find Payment
      const payment = await Payment.findOne({
        where: { uuid: paymentUuid },
      });

      if (!payment) {
        return res.status(404).json({
          message: "Payment not found",
        });
      }

      // 3. Check Payment status
      if (payment.status !== "pending") {
        return res.status(409).json({
          message: "Payment is not pending",
        });
      }

      // 4. Simulate Gateway result
      const gatewayTransactionId = `MOCK-${crypto.randomUUID()}`;

      const event = {
        eventId: crypto.randomUUID(),
        eventType:
          result === "success" ? "payment.succeeded" : "payment.failed",
        paymentUuid: payment.uuid,
        gatewayTransactionId,
        amount: payment.amount,
        currency: payment.currency,
      };

      // 5. ส่ง Event ไปยัง Webhook
      // ขั้นตอนนี้จะเชื่อมกับ Webhook ในขั้นถัดไป
      const secret = process.env.MOCK_GATEWAY_SECRET;
      if (!secret) {
        throw new Error("MOCK_GATEWAY_SECRET is not configured");
      }
      // ใช้ JSON String เดียวกันทั้งตอนสร้าง Signature และส่ง Request
      const payload = JSON.stringify(event);
      const signature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      // เก็บ Event ไว้สำหรับ Retry
      mockWebhookEvents.set(event.eventId, {
        event,
        payload,
        signature,
      });

      const response = await axios.post(
        `${process.env.API_BASE_URL}/api/webhooks/payment`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Signature": signature,
          },
        },
      );

      return res.status(200).json({
        message: "Mock payment processed",
        data: {
          event,
          webhook: response.data,
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error({
          event: "MOCK_GATEWAY_ERROR",
          status: error.response?.status,
          response: error.response?.data,
          message: error.message,
        });
      } else {
        logger.error({
          event: "MOCK_GATEWAY_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      }

      return res.status(500).json({
        message: "Mock Gateway failed",
      });
    }
  }

  static async retryWebhook(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      if (typeof eventId !== "string") {
        return res.status(400).json({
          message: "Invalid product UUID",
        });
      }
      // 1. ค้นหา Event เดิม
      const savedEvent = mockWebhookEvents.get(eventId);

      if (!savedEvent) {
        return res.status(404).json({
          message: "Webhook event not found",
        });
      }

      // 2. ส่ง Payload และ Signature เดิมซ้ำ
      const response = await axios.post(
        `${process.env.API_BASE_URL}/api/webhooks/payment`,
        savedEvent.payload,
        {
          headers: {
            "Content-Type": "application/json",
            "X-Gateway-Signature": savedEvent.signature,
          },
        },
      );

      return res.status(200).json({
        message: "Webhook retry sent",
        data: {
          event: savedEvent.event,
          webhook: response.data,
        },
      });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        logger.error({
          event: "MOCK_GATEWAY_RETRY_ERROR",
          status: error.response?.status,
          response: error.response?.data,
          message: error.message,
        });
      } else {
        logger.error({
          event: "MOCK_GATEWAY_RETRY_ERROR",
          message: error instanceof Error ? error.message : String(error),
        });
      }

      return res.status(500).json({
        message: "Webhook retry failed",
      });
    }
  }
}

export default mockGatewayController;
