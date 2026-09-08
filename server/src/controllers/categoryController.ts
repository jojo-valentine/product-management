import { Request, Response } from "express";
import { Category } from "../models/Associations";
import { Op } from "sequelize";
import { generateTagIdCategory } from "../services/TagService";
import { CategorySchema, IdParamSchema } from "../validations/category";
import {
  categoryIdExist,
  isCategoryNameExists,
} from "../services/CategoryService";
import { z } from "zod";
import { redisClient } from "../config/redis";
import logger from "../config/logger";
import { CategoryResource } from "../resources/CategoryResource";
import { CacheService } from "../services/CacheService";

class ProductController {
  static async listCategories(req: Request, res: Response) {
    try {
      const searchRaw = (req.query.search as string) || "";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = typeof searchRaw === "string" ? searchRaw.trim() : "";
      if (search.length > 100)
        return res.status(400).json({ message: "Search query too long" });
      if (page < 1)
        return res.status(400).json({ message: "Page must be >= 1" });
      if (limit < 1 || limit > 100)
        return res
          .status(400)
          .json({ message: "Limit must be between 1 and 100" });
      const offset = (page - 1) * limit;
      const where: any = {};
      const cacheKey = `categories:search=${encodeURIComponent(search)}:page=${page}:limit=${limit}`;
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { tagId: { [Op.like]: `%${search}%` } },
        ];
      }

      const { rows: categories, count } = await Category.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: [
          //   "id",
          "uuid",
          "tagId",
          "name",
          "description",
          "status",
          "createdAt",
        ],
      });

      const result = {
        data: categories,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      };
      if (redisClient) {
        await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
      }

      // logger.debug({
      //   event: "CATEGORY_LIST",
      //   page,
      //   limit,
      //   search,
      // });
      return res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Get categories failed:", error.message);
      } else {
        console.error("❌ Get categories failed:", error);
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async storeCreateCategory(req: Request, res: Response) {
    try {
      const result = CategorySchema.create.safeParse(req.body);
      if (!result.success) {
        return res.status(422).json({
          message: "Validation failed",
          errors: result.error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      const parsed = result.data;
      const exists = await isCategoryNameExists(parsed.name);
      if (exists) {
        return res.status(422).json({
          message: "Validation failed",
          errors: [
            {
              path: "name",
              message: "Category name already exists",
            },
          ],
        });
      }

      const newCategory = await Category.sequelize!.transaction(async (t) => {
        const category = await Category.create(
          {
            tagId: generateTagIdCategory("CT", 8),
            name: parsed.name,
            description: parsed.description,
            status: parsed.status,
          },
          { transaction: t },
        );
        return category;
      });

      // const keys = await redisClient.keys("categories:*");
      // if (keys.length > 0) {
      //   await redisClient.del(keys);
      //   logger.info({ event: "CACHE_CLEARED", keys });
      // }
      if (!newCategory) {
        throw new Error("Category creation failed");
      }
      const CategoryResult = CategoryResource.toJSON(newCategory);
      await CacheService.clearCategoryList();
      await CacheService.setCategory(CategoryResult);
      logger.info({
        event: "CATEGORY_CREATED",
        categoryId: newCategory.id,
        categoryUuid: newCategory.uuid,
        categoryName: newCategory.name,
        createdAt: newCategory.createdAt,
      });
      res.status(201).json({
        message: "created category successfully",
        data: CategoryResult,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        // ✅ ใช้ 422 สำหรับ validation fail
        return res.status(422).json({
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      logger.error({
        event: "CATEGORY_CREATE_ERROR",
        error: error instanceof Error ? error.message : error,
      });
      console.error("❌ create categories failed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const cacheKey = `categories:${id}`;
      const cachedCategory = await CacheService.getCategory(cacheKey);

      if (cachedCategory) {
        return res.status(200).json({
          data: cachedCategory,
        });
      }
      // เช็กว่า id มีอยู่จริง
      const exists = await categoryIdExist(id); // ใช้ฟังก์ชันสำหรับ id เดี่ยว
      if (!exists) {
        return res.status(404).json({ message: `Category id ${id} not found` });
      }

      // ดึงข้อมูล category
      const result = await Category.findOne({
        where: { uuid: id },
        attributes: ["name", "description"], // ✅ ต้องเป็น array
      });

      return res.status(200).json({ data: result });
    } catch (error: unknown) {
      console.error("❌ get category failed:", error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const category = await Category.findOne({ where: { uuid: id } });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      const parsed = CategorySchema.update.parse(req.body);

      //  เช็คชื่อซ้ำ ยกเว้นตัวเอง
      const exists = await isCategoryNameExists(parsed.name, id);
      if (exists) {
        return res.status(422).json({
          message: "Validation failed",
          errors: ["Category name already exists"],
        });
      }

      await Category.sequelize!.transaction(async (t) => {
        await Category.update(
          {
            name: parsed.name,
            description: parsed.description,
          },
          { where: { uuid: id }, transaction: t },
        );
      });
      const updatedCategory = await Category.findOne({ where: { uuid: id } });
      // เคลียร์ cache ทั้ง list และ detail
      if (!updatedCategory) {
        throw new Error("Category updated failed");
      }
      const CategoryResult = CategoryResource.toJSON(updatedCategory);
      await CacheService.clearCategoryList();
      await CacheService.clearCategory(id);
      await CacheService.setCategory(CategoryResult);
      logger.info({
        event: "CATEGORY_UPDATED",
        categoryId: updatedCategory.id,
        categoryUuid: updatedCategory.uuid,
        categoryName: updatedCategory.name,
        createdAt: updatedCategory.updatedAt,
      });
      res.status(200).json({
        message: "update category successfully",
        data: CategoryResult,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      // ถ้า JSON format ไม่ถูกต้อง → 400
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      logger.error({
        event: "CATEGORY_UPDATED_ERROR",
        error: error instanceof Error ? error.message : error,
      });
      console.error("❌ update category failed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async changeCategory(req: Request, res: Response) {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const category = await Category.findOne({ where: { uuid: id } });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const parsed = CategorySchema.change.parse(req.body);

      await Category.sequelize!.transaction(async (t) => {
        await Category.update(
          { status: parsed.status },
          { where: { uuid: id }, transaction: t },
        );
      });

      const updatedCategory = await Category.findOne({ where: { uuid: id } });
      // เคลียร์ cache ทั้ง list และ detail
      if (!updatedCategory) {
        throw new Error("Category change status failed");
      }
      const CategoryResult = CategoryResource.toJSON(updatedCategory);
      await CacheService.clearCategoryList();
      await CacheService.clearCategory(id);
      await CacheService.setCategory(CategoryResult);
      logger.info({
        event: "CATEGORY_change_status",
        categoryId: updatedCategory.id,
        categoryUuid: updatedCategory.uuid,
        categoryName: updatedCategory.name,
        createdAt: updatedCategory.updatedAt,
      });
      res.status(200).json({
        message: "change status category successfully",
        data: CategoryResult,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      logger.error({
        event: "CATEGORY_UPDATED_ERROR",
        error: error instanceof Error ? error.message : error,
      });
      console.error("❌ create categories failed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const category = await Category.findOne({ where: { uuid: id } });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      await Category.destroy({
        where: { uuid: id },
      });

      if (!category) {
        throw new Error("Category delete failed");
      }
      // เคลียร์ cache ทั้ง list และ detail
      await CacheService.clearCategoryList();
      await CacheService.clearCategory(id);

      logger.warn({
        event: "CATEGORY_delete",
        categoryId: category.id,
        categoryUuid: category.uuid,
        categoryName: category.name,
        deletedAt: category.deletedAt,
      });
      return res.status(200).json({
        message: "soft deleted category successfully",
        id,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return res.status(422).json({
          message: "Validation failed",
          errors: error.issues.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
      logger.error({
        event: "CATEGORY_DELETE_ERROR",
        error: error instanceof Error ? error.message : error,
      });
      console.error("❌ delete  categories failed:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async getCategoriesForProduct(req: Request, res: Response) {
    try {
      const categories = await Category.findAll({
        where: {
          status: true,
        },
        attributes: ["uuid", "name"],
        order: [["name", "ASC"]],
      });

      return res.json({
        data: categories,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Get categories for product failed:", error.message);
      } else {
        console.error("❌ Get categories for product failed:", error);
      }

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}
export default ProductController;
