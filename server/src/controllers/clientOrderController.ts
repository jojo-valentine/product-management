import { randomUUID } from "crypto";
import { Request, Response } from "express";
import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { Order, OrderItem, Product } from "../models/Associations";
import { sendN8nWebhook } from "../services/n8n.service";

type CreateOrderItem = {
  productUuid: string;
  quantity: number;
};

export default class ClientOrderController {
  static async createOrder(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const customerName = String(req.body.customerName ?? "").trim();
      const customerPhone = String(req.body.customerPhone ?? "").trim();
      const rawItems = req.body.items as CreateOrderItem[];

      if (!customerName || !customerPhone) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Customer name and phone are required",
        });
      }

      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Order items are required",
        });
      }

      // รวมสินค้าซ้ำให้เหลือรายการเดียว
      const quantities = new Map<string, number>();

      for (const item of rawItems) {
        const quantity = Number(item.quantity);

        if (!item.productUuid || !Number.isInteger(quantity) || quantity < 1) {
          await transaction.rollback();

          return res.status(400).json({
            message: "Invalid order item",
          });
        }

        quantities.set(
          item.productUuid,
          (quantities.get(item.productUuid) ?? 0) + quantity,
        );
      }

      const orderItems: {
        productId: number;
        productName: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }[] = [];

      let totalAmount = 0;

      for (const [productUuid, quantity] of quantities) {
        const product = await Product.findOne({
          where: {
            uuid: productUuid,
            status: "active",
            deletedAt: {
              [Op.is]: null,
            },
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          await transaction.rollback();

          return res.status(409).json({
            message: "Some products are unavailable",
            productUuid,
          });
        }

        if (product.stock < quantity) {
          await transaction.rollback();

          return res.status(409).json({
            message: "Insufficient stock",
            productUuid,
            availableStock: product.stock,
          });
        }

        const totalPrice = product.price * quantity;
        totalAmount += totalPrice;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          quantity,
          unitPrice: product.price,
          totalPrice,
        });
      }

      const orderNumber = `ORD-${Date.now()}-${randomUUID()
        .slice(0, 6)
        .toUpperCase()}`;

      const order = await Order.create(
        {
          orderNumber,
          customerName,
          customerPhone,
          totalAmount,
          orderStatus: "pending",
          paymentStatus: "pending",
        },
        {
          transaction,
        },
      );

      await OrderItem.bulkCreate(
        orderItems.map((item) => ({
          orderId: order.id,
          ...item,
        })),
        {
          transaction,
        },
      );
      const lowStockItems: {
        productId: number;
        name: string;
        stock: number;
        threshold: number;
      }[] = [];

      const threshold = Number(process.env.LOW_STOCK_THRESHOLD ?? 5);

      for (const item of orderItems) {
        // await Product.decrement("stock", {
        //   by: item.quantity,
        //   where: {
        //     id: item.productId,
        //   },
        //   transaction,
        // });
        const product = await Product.findByPk(item.productId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        const previousStock = product.stock;

        await Product.decrement("stock", {
          by: item.quantity,
          where: { id: item.productId },
          transaction,
        });

        const newStock = previousStock - item.quantity;

        if (previousStock > threshold && newStock <= threshold) {
          lowStockItems.push({
            productId: item.productId,
            name: item.productName,
            stock: newStock,
            threshold,
          });
        }
      }

      await transaction.commit();
      console.log({
        orderId: order.orderNumber,
        total: order.totalAmount,
        items: orderItems.map((item) => ({
          productId: item.productId,
          name: item.productName,
          quantity: item.quantity,
        })),
        customerName: customerName,
        customerPhone: customerPhone,
      });

      void sendN8nWebhook(
        `${process.env.N8N_WEBHOOK_URL}/webhook/order-created`,
        {
          event: "order.created",
          orderId: order.orderNumber,
          total: order.totalAmount,
          items: orderItems.map((item) => ({
            productId: item.productId,
            name: item.productName,
            quantity: item.quantity,
          })),
          customerName: customerName,
          customerPhone: customerPhone,
        },
      );

      // แจ้งเตือนสินค้าใกล้หมดแต่ละรายการ
      for (const item of lowStockItems) {
        console.log({
          event: "stock.low",
          productId: item.productId,
          name: item.name,
          stock: item.stock,
          threshold: item.threshold,
        });

        void sendN8nWebhook(
          `${process.env.N8N_WEBHOOK_URL}/webhook/low-stock`,
          {
            event: "stock.low",
            productId: item.productId,
            name: item.name,
            stock: item.stock,
            threshold: item.threshold,
          },
        );
      }

      return res.status(201).json({
        message: "Order created successfully",
        data: {
          uuid: order.uuid,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error) {
      await transaction.rollback();

      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Create order failed:", message);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async mockPayOrder(req: Request, res: Response) {
    try {
      const { uuid } = req.params;

      const order = await Order.findOne({
        where: { uuid },
      });

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (order.orderStatus === "cancelled") {
        return res.status(409).json({
          message: "This order has been cancelled",
        });
      }

      if (order.paymentStatus === "paid") {
        return res.status(200).json({
          message: "Order has already been paid",
          data: order,
        });
      }

      if (order.paymentStatus !== "pending") {
        return res.status(409).json({
          message: "This order cannot be paid",
        });
      }

      await order.update({
        paymentStatus: "paid",
        orderStatus: "confirmed",
      });

      return res.status(200).json({
        message: "Payment completed successfully",
        data: {
          uuid: order.uuid,
          orderNumber: order.orderNumber,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      console.error("❌ Mock payment failed:", message);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
