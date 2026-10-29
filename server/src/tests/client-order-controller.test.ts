import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

// Mock database transaction
vi.mock("../config/database", () => ({
  sequelize: {
    transaction: vi.fn(),
  },
}));

// Mock Sequelize models
vi.mock("../models/Associations", () => ({
  Product: {
    findOne: vi.fn(),
    findByPk: vi.fn(),
    decrement: vi.fn(),
  },
  Order: {
    create: vi.fn(),
  },
  OrderItem: {
    bulkCreate: vi.fn(),
  },
}));

// ไม่เรียก n8n จริงระหว่างทดสอบ
vi.mock("../services/n8n.service", () => ({
  sendN8nWebhook: vi.fn(),
}));

import { sequelize } from "../config/database";
import { Product, Order, OrderItem } from "../models/Associations";
import { sendN8nWebhook } from "../services/n8n.service";
import ClientOrderController from "../controllers/clientOrderController";

describe("ClientOrderController.createOrder", () => {
  const transaction = {
    LOCK: { UPDATE: "UPDATE" },
    commit: vi.fn(),
    rollback: vi.fn(),
  };

  const product = {
    id: 10,
    uuid: "product-123",
    name: "Keyboard",
    price: 100,
    stock: 5,
    status: "active",
  };

  const order = {
    id: 20,
    uuid: "order-123",
    orderNumber: "ORD-TEST-001",
    totalAmount: 200,
    orderStatus: "pending",
    paymentStatus: "pending",
  };

  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(sequelize.transaction).mockResolvedValue(transaction as never);

    vi.mocked(Product.findOne).mockResolvedValue(product as never);

    vi.mocked(Product.findByPk).mockResolvedValue(product as never);

    vi.mocked(Product.decrement).mockResolvedValue([1] as never);

    vi.mocked(Order.create).mockResolvedValue(order as never);

    vi.mocked(OrderItem.bulkCreate).mockResolvedValue([] as never);

    req = {
      body: {
        customerName: "Jojo",
        customerPhone: "0812345678",
        items: [
          {
            productUuid: "product-123",
            quantity: 2,
          },
        ],
      },
    } as Request;

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it("should create an order and decrease stock", async () => {
    await ClientOrderController.createOrder(req, res);

    // ตรวจ HTTP response
    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith({
      message: "Order created successfully",
      data: {
        uuid: "order-123",
        orderNumber: "ORD-TEST-001",
        totalAmount: 200,
        orderStatus: "pending",
        paymentStatus: "pending",
      },
    });

    // ตรวจว่าคำนวณยอดและสร้างข้อมูลถูกต้อง
    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "Jojo",
        customerPhone: "0812345678",
        totalAmount: 200,
      }),
      expect.objectContaining({ transaction }),
    );

    expect(OrderItem.bulkCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          orderId: 20,
          productId: 10,
          productName: "Keyboard",
          quantity: 2,
          unitPrice: 100,
          totalPrice: 200,
        }),
      ],
      expect.objectContaining({ transaction }),
    );

    // ตรวจว่ามีคำสั่งตัด Stock 2 ชิ้น
    expect(Product.decrement).toHaveBeenCalledWith("stock", {
      by: 2,
      where: { id: 10 },
      transaction,
    });

    // ต้อง Commit และไม่ Rollback
    expect(transaction.commit).toHaveBeenCalledOnce();
    expect(transaction.rollback).not.toHaveBeenCalled();

    // n8n ต้องไม่ถูกเรียกใช้งานจริง
    expect(sendN8nWebhook).toHaveBeenCalled();
  });

  it("should reject order when stock is insufficient", async () => {
    // จำลองว่ามีสินค้าเหลือเพียง 1 ชิ้น
    vi.mocked(Product.findOne).mockResolvedValue({
      ...product,
      stock: 1,
    } as never);

    // ลูกค้าสั่ง 2 ชิ้น
    req.body.items = [
      {
        productUuid: "product-123",
        quantity: 2,
      },
    ];

    await ClientOrderController.createOrder(req, res);

    // ต้องตอบกลับ 409
    expect(res.status).toHaveBeenCalledWith(409);

    expect(res.json).toHaveBeenCalledWith({
      message: "Insufficient stock",
      productUuid: "product-123",
      availableStock: 1,
    });

    // ต้องไม่สร้าง Order หรือ OrderItem
    expect(Order.create).not.toHaveBeenCalled();
    expect(OrderItem.bulkCreate).not.toHaveBeenCalled();

    // ต้องไม่ตัด Stock
    expect(Product.decrement).not.toHaveBeenCalled();

    // ต้อง Rollback และไม่ Commit
    expect(transaction.rollback).toHaveBeenCalledOnce();
    expect(transaction.commit).not.toHaveBeenCalled();

    // ต้องไม่ส่งการแจ้งเตือน
    expect(sendN8nWebhook).not.toHaveBeenCalled();
  });

  it("should rollback when creating order items fails", async () => {
    // จำลองว่า OrderItem บันทึกไม่สำเร็จ
    vi.mocked(OrderItem.bulkCreate).mockRejectedValue(
      new Error("Database insert failed"),
    );

    await ClientOrderController.createOrder(req, res);

    // API ต้องตอบ Internal Server Error
    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });

    // ต้องพยายามสร้าง Order ก่อน
    expect(Order.create).toHaveBeenCalledOnce();

    // OrderItem เกิด Error
    expect(OrderItem.bulkCreate).toHaveBeenCalledOnce();

    // Transaction ต้อง Rollback
    expect(transaction.rollback).toHaveBeenCalledOnce();

    // ต้องไม่ Commit
    expect(transaction.commit).not.toHaveBeenCalled();

    // ต้องไม่ตัด Stock เพราะยังไม่ผ่านการบันทึก OrderItem
    expect(Product.decrement).not.toHaveBeenCalled();

    // ต้องไม่ส่งแจ้งเตือนเมื่อ Order ไม่สำเร็จ
    expect(sendN8nWebhook).not.toHaveBeenCalled();
  });

  it("should merge duplicate products before creating order", async () => {
    // Stock 10 ชิ้น เพียงพอต่อการสั่งรวม 5 ชิ้น
    vi.mocked(Product.findOne).mockResolvedValue({
      ...product,
      stock: 10,
    } as never);

    vi.mocked(Product.findByPk).mockResolvedValue({
      ...product,
      stock: 10,
    } as never);

    req.body.items = [
      { productUuid: "product-123", quantity: 2 },
      { productUuid: "product-123", quantity: 3 },
    ];

    await ClientOrderController.createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(201);

    // สินค้ารหัสเดียวกันต้องถูกรวมเป็นรายการเดียว จำนวน 5 ชิ้น
    expect(OrderItem.bulkCreate).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          productId: 10,
          productName: "Keyboard",
          quantity: 5,
          unitPrice: 100,
          totalPrice: 500,
        }),
      ],
      expect.objectContaining({ transaction }),
    );

    // ตัด Stock เพียงครั้งเดียว จำนวน 5 ชิ้น
    expect(Product.decrement).toHaveBeenCalledTimes(1);
    expect(Product.decrement).toHaveBeenCalledWith("stock", {
      by: 5,
      where: { id: 10 },
      transaction,
    });

    expect(Order.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalAmount: 500 }),
      expect.objectContaining({ transaction }),
    );

    expect(transaction.commit).toHaveBeenCalledOnce();
    expect(transaction.rollback).not.toHaveBeenCalled();
  });

  it("should reject order when product is unavailable", async () => {
    vi.mocked(Product.findOne).mockResolvedValue(null);

    req.body.items = [{ productUuid: "missing-product", quantity: 1 }];

    await ClientOrderController.createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Some products are unavailable",
      productUuid: "missing-product",
    });

    expect(Order.create).not.toHaveBeenCalled();
    expect(OrderItem.bulkCreate).not.toHaveBeenCalled();
    expect(Product.decrement).not.toHaveBeenCalled();

    expect(transaction.rollback).toHaveBeenCalledOnce();
    expect(transaction.commit).not.toHaveBeenCalled();
    expect(sendN8nWebhook).not.toHaveBeenCalled();
  });

  it("should reject order when customer name is missing", async () => {
    req.body.customerName = "";

    await ClientOrderController.createOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(Order.create).not.toHaveBeenCalled();
    expect(Product.decrement).not.toHaveBeenCalled();
  });
});
