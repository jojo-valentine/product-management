import { Router, Request, Response } from "express";
import categoryController from "../controllers/categoryController";
const router = Router();

/**
 * @swagger
 * /api/category/lists:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Category
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: Outdoors
 *         description: คำค้นหาที่ใช้ filter category ,TagId  ตามชื่อหรือรายละเอียด
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: หน้าที่ต้องการ (pagination)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: จำนวนข้อมูลต่อหน้า
 *     responses:
 *       200:
 *         description: Success
 */

router.get("/lists", categoryController.listCategories);
router.get("/for-product", categoryController.getCategoriesForProduct);
/**
 * @swagger
 * /api/category/store:
 *   post:
 *     summary: Create category
 *     tags:
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: test43
 *                 description: สร้างชื่อ category
 *               description:
 *                 type: string
 *                 example: test description
 *                 description: อธิบาย description category
 *               status:
 *                 type: string
 *                 example: 1
 *                 description: สถานะ category
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/store", categoryController.storeCreateCategory);
/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: get category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID ของ category ที่ต้องการแก้ไข
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.get("/:id", categoryController.getCategoryById);
/**
 * @swagger
 * /api/category/{id}/update:
 *   put:
 *     summary: Update category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID ของ category ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: updated name
 *               description:
 *                 type: string
 *                 example: updated description

 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 */
router.put("/:id/update", categoryController.updateCategory);
/**
 * @swagger
 * /api/category/{id}/action:
 *   patch:
 *     summary: Updated status category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: uuid ของ category ที่ต้องการแก้ไข
 *     requestBody:
 *       required: true
 *       content :
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                status:
 *                 type: string
 *                 example: 1
 *                 description: สถานะ category
 *     responses:
 *       201:
 *         description: Category Updated
 *       404:
 *         description: Category not found
 */
router.patch("/:id/action", categoryController.changeCategory);
/**
 * @swagger
 * /api/category/{id}/delete:
 *   delete:
 *     summary: delete category
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: uuid ของ category ที่ต้องการแก้ไข
 *     responses:
 *       201:
 *         description: Category delete
 *       404:
 *         description: Category not found
 */
router.delete("/:id/delete", categoryController.deleteCategory);
// router

export default router;
