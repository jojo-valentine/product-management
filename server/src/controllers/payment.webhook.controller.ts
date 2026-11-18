import { Request, Response } from "express";
import crypto from "node:crypto";
import logger from "../config/logger";
import { PaymentWebhookEvents, Order, Payment } from "../models/Associations";
import { PaymentEventType } from "../types/IPayment";

interface PaymentEvent {
  eventId: string;
  eventType: PaymentEventType;
  paymentUuid: string;
  gatewayTransactionId: string;
  amount: string | number;
  currency: string;
}

// แปลงยอดเงินเป็นสตางค์ เพื่อเปรียบเทียบโดยไม่ใช้ Floating Point
const toSatang = (amount: string | number): number => {
  return Math.round(Number(amount) * 100);
};
class PaymentWebhookController {
  static async handleWebhook(req: Request, res: Response) {
    try {
      // 1. รับ Raw Body และ Signature
      const rawBody = req.body as Buffer;
      const signature = req.header("X-Gateway-Signature");
      const secret = process.env.MOCK_GATEWAY_SECRET;

      if (!Buffer.isBuffer(rawBody) || !signature || !secret) {
        return res.status(400).json({
          message: "Invalid webhook request",
        });
      }

      // 2. ตรวจสอบ HMAC Signature
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      const received = Buffer.from(signature, "hex");
      const expected = Buffer.from(expectedSignature, "hex");

      if (
        received.length !== expected.length ||
        !crypto.timingSafeEqual(received, expected)
      ) {
        return res.status(401).json({
          message: "Invalid signature",
        });
      }

      // 3. Parse Event หลังตรวจ Signature ผ่านแล้ว
      const event = JSON.parse(rawBody.toString("utf8")) as PaymentEvent;

      if (
        !event.eventId ||
        !event.paymentUuid ||
        !event.gatewayTransactionId ||
        !["payment.succeeded", "payment.failed"].includes(event.eventType) ||
        !Number.isFinite(toSatang(event.amount)) ||
        toSatang(event.amount) <= 0 ||
        event.currency !== "THB"
      ) {
        return res.status(400).json({
          message: "Invalid webhook payload",
        });
      }

      // 4. ประมวลผล Event ภายใน Transaction
      const result = await Payment.sequelize!.transaction(async (t) => {
        // ป้องกัน Event ซ้ำ
        const existingEvent = await PaymentWebhookEvents.findOne({
          where: { event_id: event.eventId },
          transaction: t,
        });

        if (existingEvent) {
          return "duplicate";
        }

        // ค้นหา Payment และ Lock Row
        const payment = await Payment.findOne({
          where: { uuid: event.paymentUuid },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!payment) {
          throw new Error("PAYMENT_NOT_FOUND");
        }

        if (payment.status !== "pending") {
          throw new Error("PAYMENT_NOT_PENDING");
        }

        // ตรวจสอบยอดเงินและ Currency
        if (
          toSatang(payment.amount) !== toSatang(event.amount) ||
          payment.currency !== event.currency
        ) {
          throw new Error("PAYMENT_AMOUNT_MISMATCH");
        }

        // ค้นหา Order
        const order = await Order.findByPk(payment.order_id, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        if (
          order.paymentStatus === "paid" ||
          order.orderStatus === "cancelled"
        ) {
          throw new Error("ORDER_NOT_PAYABLE");
        }

        // 5. บันทึก Webhook Event
        await PaymentWebhookEvents.create(
          {
            uuid: crypto.randomUUID(),
            event_id: event.eventId,
            payment_id: payment.id,
            event_type: event.eventType,
            payload: event as unknown as Record<string, unknown>,
            signature_valid: true,
            processing_status: "processed",
            processed_at: new Date(),
            error_message: null,
          },
          { transaction: t },
        );

        // 6. Update Payment
        const succeeded = event.eventType === "payment.succeeded";

        await payment.update(
          {
            status: succeeded ? "succeeded" : "failed",
            gateway_transaction_id: event.gatewayTransactionId,
            paid_at: succeeded ? new Date() : null,
          },
          { transaction: t },
        );

        // 7. Update Order
        await order.update(
          {
            paymentStatus: succeeded ? "paid" : "failed",
          },
          { transaction: t },
        );

        return "processed";
      });

      return res.status(200).json({
        message:
          result === "duplicate"
            ? "Event already processed"
            : "Webhook processed successfully",
        duplicate: result === "duplicate",
      });
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      logger.error({
        event: "PAYMENT_WEBHOOK_ERROR",
        error: message,
      });

      const errors: Record<string, { status: number; message: string }> = {
        PAYMENT_NOT_FOUND: {
          status: 404,
          message: "Payment not found",
        },
        ORDER_NOT_FOUND: {
          status: 404,
          message: "Order not found",
        },
        PAYMENT_NOT_PENDING: {
          status: 409,
          message: "Payment is not pending",
        },
        PAYMENT_AMOUNT_MISMATCH: {
          status: 400,
          message: "Payment amount or currency mismatch",
        },
        ORDER_NOT_PAYABLE: {
          status: 409,
          message: "Order is not payable",
        },
      };

      const knownError = errors[message];

      return res.status(knownError?.status ?? 500).json({
        message: knownError?.message ?? "Internal server error",
      });
    }
  }
}

export default PaymentWebhookController;
