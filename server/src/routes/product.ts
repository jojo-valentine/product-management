import { Router, Request, Response } from "express";
import ProductController from "../controllers/productController";
import {
  uploadProductImages,
  uploadProductNewImages,
} from "../middleware/upload";
const router = Router();
/**
 * @swagger
 * /api/products/lists:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: Outdoors
 *         description: คำค้นหาที่ใช้ filter products, TagId ตามชื่อหรือรายละเอียด
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการ (pagination)
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนข้อมูลต่อหน้า
 *
 *       - in: query
 *         name: categoryId
 *         required: false
 *         style: form
 *         explode: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           example:
 *             - "d40ea464-3631-4f66-9125-6af5b72821d7,ba6d6555-1b70-427f-be5a-6025b91991de"
 *         description: UUID ของ categories ที่ต้องการ filter
 *
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/lists", ProductController.getProducts);
/**
 * @swagger
 * /api/products/store:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - detail
 *               - price
 *               - stock
 *               - categoryIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: "teest234"
 *                 description: Product name
 *
 *               detail:
 *                 type: string
 *                 example: "The Extended systemic infrastructure"
 *                 description: Product detail
 *
 *               price:
 *                 type: number
 *                 example: 2000
 *                 description: Product price
 *
 *               stock:
 *                 type: integer
 *                 example: 56
 *                 description: Product stock quantity
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                   - archived
 *                 example: active
 *                 description: Product status
 *
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "d40ea464-3631-4f66-9125-6af5b72821d7"
 *                   - "ba6d6555-1b70-427f-be5a-6025b91991de"
 *                 description: Category UUIDs
 *
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images
 *
 *           encoding:
 *             categoryIds:
 *               style: form
 *               explode: true
 *             images:
 *               style: form
 *               explode: true
 *
 *     responses:
 *       201:
 *         description: Product created successfully
 *
 *       400:
 *         description: Bad request
 *
 *       422:
 *         description: Validation error
 *
 *       500:
 *         description: Internal server error
 */
router.post("/store", uploadProductImages, ProductController.productStore);
/**
 * @swagger
 * /api/products/upload/productImage/{id}/store:
 *   post:
 *     summary: Upload product images
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ต้องการเพิ่มรูปภาพ
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images
 *           encoding:
 *             images:
 *               style: form
 *               explode: true
 *
 *     responses:
 *       201:
 *         description: Product upload successfully
 *
 *       400:
 *         description: Bad request
 *
 *       404:
 *         description: Product not found
 *
 *       422:
 *         description: Validation error
 *
 *       500:
 *         description: Internal server error
 */
router.post(
  "/upload/productImage/:id/store",
  uploadProductImages,
  uploadProductNewImages,
  ProductController.productImageStore,
);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: get product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID ของ product ที่ต้องการแก้ไข
 *     responses:
 *       200:
 *         description: product updated successfully
 *       404:
 *         description: product not found
 */
router.get("/:id", ProductController.getProductData);
/**
 * @swagger
 * /api/products/{id}/:
 *   put:
 *     summary: Update product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ต้องการเพิ่มรูปภาพ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - detail
 *               - price
 *               - stock
 *               - categoryIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: "teest234"
 *                 description: Product name
 *
 *               detail:
 *                 type: string
 *                 example: "The Extended systemic infrastructure"
 *                 description: Product detail
 *
 *               price:
 *                 type: number
 *                 example: 2000
 *                 description: Product price
 *
 *               stock:
 *                 type: integer
 *                 example: 56
 *                 description: Product stock quantity
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                   - archived
 *                 example: active
 *                 description: Product status
 *
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example:
 *                   - "d40ea464-3631-4f66-9125-6af5b72821d7"
 *                   - "ba6d6555-1b70-427f-be5a-6025b91991de"
 *                 description: Category UUIDs
 *           encoding:
 *             categoryIds:
 *               style: form
 *               explode: true
 *
 *     responses:
 *       201:
 *         description: Product update successfully
 *
 *       400:
 *         description: Bad request
 *
 *       404:
 *         description: Product not found
 *
 *       422:
 *         description: Validation error
 *
 *       500:
 *         description: Internal server error
 */
router.put("/:id", ProductController.update);
/**
 * @swagger
 * /api/products/{id}/:
 *   delete:
 *     summary: delete product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ต้องการลบ
 *
 *     responses:
 *       201:
 *         description: Product delete successfully
 *
 *       400:
 *         description: Bad request
 *
 *       404:
 *         description: Product not found
 *
 *       422:
 *         description: Validation error
 *
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", ProductController.destroy);
/**
 * @swagger
 * /api/products/{id}/status:
 *   patch:
 *     summary: update show post product
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ต้องการลบ
 *     requestBody:   # ✅ ต้องใช้ requestBody แทน content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                   - archived
 *                 example: active
 *                 description: Product status
 *     responses:
 *       200:   # ✅ PATCH ควรใช้ 200 หรือ 204 มากกว่า 201
 *         description: product change successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.patch("/:id/status", ProductController.updateStatus);
/**
 * @swagger
 * /api/products/{productId}/images/{imageId}:
 *   delete:
 *     summary: delete product image visibility
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ image belong
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ image ที่ต้องการเปลี่ยนลบ
 *
 *     responses:
 *       200:
 *         description: Product image delete updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product or image not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.delete("/:productId/images/:imageId", ProductController.deleteImage);
/**
 * @swagger
 * /api/products/{productId}/images/{imageId}/visibility:
 *   patch:
 *     summary: Update product image visibility
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ product ที่ image belong
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID ของ image ที่ต้องการเปลี่ยนสถานะ
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - inactive
 *                   - archived
 *                 example: active
 *                 description: New status of the product image
 *     responses:
 *       200:
 *         description: Product image status updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Product or image not found
 *       422:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

router.patch(
  "/:productId/images/:imageId/visibility",
  ProductController.toggleImageVisibility,
);
// router.get("/", (req: Request, res: Response) => {
//   res.send("✅ Product API is working!");
// });
export default router;
