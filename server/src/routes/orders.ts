import { Router, Request, Response } from "express";
import ClientOrderController from "../controllers/clientOrderController";
const router = Router();
/**
 * @swagger
 * /api/orders/create-order:
 *   post:
 *     summary: สร้างคำสั่งซื้อจากตะกร้าสินค้า
 *     tags:
 *       - Client Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Test User
 *               customerPhone:
 *                 type: string
 *                 example: "0800000000"
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productUuid
 *                     - quantity
 *                   properties:
 *                     productUuid:
 *                       type: string
 *                       format: uuid
 *                       example: 31382574-e757-419a-876b-3bb05e12757a
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 1
 *     responses:
 *       201:
 *         description: สร้าง Order สำเร็จ
 *       400:
 *         description: ข้อมูลที่ส่งมาไม่ถูกต้อง
 *       409:
 *         description: สินค้าถูกระงับหรือมี stock ไม่พอ
 *       500:
 *         description: Internal server error
 */

router.post("/create-order", ClientOrderController.createOrder);

router.patch(
  "/:uuid/pay",
  ClientOrderController.mockPayOrder,
);
router.get("/", (req, res) => res.send("orders"));
export default router;
