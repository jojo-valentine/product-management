import { Request, Response } from "express";
import logger from "../config/logger";
import Order from "../models/Order";
import { uuid } from "zod";
import Payment from "../models/Payment";

class paymentController {
  static async createPayment(req: Request, res: Response) {
    try {
      const idempotencyKey = req.header("Idempotency-Key");
      const { orderUuid } = req.body;
      console.log({ idempotencyKey, orderUuid });

      if (!idempotencyKey) {
        return res.status(400).json({
          message: "Idempotency-Key is required",
        });
      }

      if (!orderUuid) {
        return res.status(400).json({
          message: "orderUuid is required",
        });
      }

      const result = await Order.sequelize?.transaction(async (t) => {
        const order = await Order.findOne({
          where: { uuid: orderUuid },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        // 2. Check existing Payment by Idempotency Key
        const existingPayment = await Payment.findOne({
          where: { idempotency_key: idempotencyKey },
          transaction: t,
        });

        if (existingPayment) {
          // Prevent using the same key with another Order
          if (existingPayment.order_id !== order.id) {
            throw new Error("IDEMPOTENCY_KEY_CONFLICT");
          }

          // Return existing Payment
          return {
            payment: existingPayment,
            isExisting: true,
          };
        }

        // 3. Check Order status
        if (order.paymentStatus === "paid") {
          throw new Error("ORDER_ALREADY_PAID");
        }

        if (order.orderStatus === "cancelled") {
          throw new Error("ORDER_CANCELLED");
        }

        // 4. Create Payment
        const payment = await Payment.create(
          {
            uuid: crypto.randomUUID(),
            order_id: order.id,
            idempotency_key: idempotencyKey,
            payment_method: "promptpay",
            amount: order.totalAmount,
            currency: "THB",
            status: "pending",
          },
          { transaction: t },
        );

        return {
          payment,
          isExisting: false,
        };
      });
      if (!result) {
        throw new Error("Transaction failed");
      }
      return res.status(result.isExisting ? 200 : 201).json({
        message: result.isExisting
          ? "Payment already exists"
          : "Payment created successfully",
        data: result.payment,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      const errorResponses: Record<
        string,
        { status: number; message: string }
      > = {
        ORDER_NOT_FOUND: {
          status: 404,
          message: "Order not found",
        },
        IDEMPOTENCY_KEY_CONFLICT: {
          status: 409,
          message: "Idempotency-Key is already used for another order",
        },
        ORDER_ALREADY_PAID: {
          status: 409,
          message: "Order has already been paid",
        },
        ORDER_CANCELLED: {
          status: 409,
          message: "Order has been cancelled",
        },
      };

      logger.error({
        event: "PAYMENT_ERROR",
        error: message,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const knownError = errorResponses[message];

      return res.status(knownError?.status ?? 500).json({
        message: knownError?.message ?? "Internal server error",
      });
    }
  }

 
}

export default paymentController;
