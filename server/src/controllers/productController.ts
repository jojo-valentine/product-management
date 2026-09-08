import { Request, Response } from "express";
import {
  Product,
  Category,
  ProductImage,
  ProductCategories,
} from "../models/Associations";
import { Op, ValidationError, where } from "sequelize";
import { IncludeOptions } from "sequelize";
import {
  productSchema,
  validateCheckIdProduct,
  validateProduct,
  validateProductUpdate,
  validateProductUpdateStatus,
  validateStatus,
} from "../validations/product";
import {
  generateTagIdCategory,
  generateTagIdProduct,
} from "../services/TagService";
import { getCategoryIdsFromUuids } from "../services/CategoryService";
import fileService from "../services/FileService";
import path from "path";
import fs from "fs";
import { validateProductImageLimit } from "../validations/product";
import {
  productIdExist,
  productImageIdsExist,
} from "../services/ProductService";
import logger from "../config/logger";
import { uuid } from "zod";
import { redisClient } from "../config/redis";
import { ProductResource } from "../resources/ProductResource";
import { CacheService } from "../services/CacheService";
import { findProductWithRelations } from "../repositories/productRepository";

class ProductController {
  static async getProducts(req: Request, res: Response) {
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
      const categoryRaw = req.query.categoryId;

      const categoryId =
        typeof categoryRaw === "string"
          ? categoryRaw.split(",")
          : Array.isArray(categoryRaw)
            ? categoryRaw
            : [];

      const offset = (page - 1) * limit;
      const where: any = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { detail: { [Op.like]: `%${search}%` } },
          { tagId: { [Op.like]: `%${search}%` } },
        ];
      }
      const includeCategory: IncludeOptions = {
        model: Category,
        as: "categories",
        attributes: ["uuid", "name"],
        through: {
          attributes: [],
        },
      };

      // 🔎 filter by categoryUuids
      if (categoryId.length > 0) {
        // where.categoryUuids = category;
        includeCategory.where = {
          uuid: {
            [Op.in]: categoryId,
          },
          status: true,
        };
      }
      const categoryKey = [...categoryId].sort().join(",");
      const cacheKey =
        `products:category=${encodeURIComponent(categoryKey)}` +
        `:search=${encodeURIComponent(search)}` +
        `:page=${page}` +
        `:limit=${limit}`;
      // 🔎 เช็ค cache ก่อน
      if (redisClient) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          // console.log(`✅ ใช้ cache: ${cacheKey}`);
          return res.json(JSON.parse(cached));
        }
      }

      const { rows: products, count } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: [
          //   "id",
          "uuid",
          "tagId",
          "name",
          "detail",
          "price",
          "stock",
          "status",
          "createdAt",
        ],
        include: [
          includeCategory,
          {
            model: ProductImage,
            as: "images",
            where: {
              deletedAt: {
                [Op.is]: null,
              },
            },
            attributes: ["uuid", "path", "image"],
            required: false,
          },
        ],
        distinct: true,
      });

      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found" });
      }
      const result = {
        data: products,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
      };
      // console.log(`💾 เก็บ product cache ใหม่: ${cacheKey}`);
      if (redisClient) {
        await redisClient.set(cacheKey, JSON.stringify(result), { EX: 60 });
      }
      return res.json(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Get products failed:", error.message);
      } else {
        console.error("❌ Get products failed:", error);
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async productStore(req: Request, res: Response) {
    const result = await validateProduct(req, res);
    // ถ้า validateProduct ส่ง response error กลับไปแล้ว → return เลย
    if ("headersSent" in result) {
      return; // response already sent by validateProduct
    }
    //  TypeScript now knows result is { errors, data }
    if (result.errors.length > 0 || !result.data) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.errors,
      });
    }
    const data = result.data;
    try {
      const newProduct = await Product.sequelize!.transaction(async (t) => {
        const product = await Product.create(
          {
            tagId: generateTagIdProduct(),
            name: data.name,
            detail: data.detail,
            price: data.price,
            stock: data.stock,
            status: data.status,
          },
          { transaction: t },
        );
        const categoryIds = await getCategoryIdsFromUuids(data.categoryIds);
        await ProductCategories.bulkCreate(
          categoryIds.map((cid) => ({
            productId: product.id,
            categoryId: cid,
          })),
          {
            transaction: t,
          },
        );
        const relativeFolder = path.join("products", product.uuid);
        const destinationFolder = path.join(
          process.cwd(),
          "uploads",
          relativeFolder,
        );
        if (!fs.existsSync(destinationFolder)) {
          await fileService.createDirectory(destinationFolder);
        }
        const movedFiles = await fileService.moveFiles(
          req.files as Express.Multer.File[],
          destinationFolder,
        );
        await ProductImage.bulkCreate(
          movedFiles.map((newPath) => ({
            productId: product.id,
            path: relativeFolder,
            image: path.basename(newPath),
            status: "active",
          })),
          {
            transaction: t,
          },
        );
        return { product };
      });
      const productWithRelations = await findProductWithRelations(
        newProduct.product.dataValues.uuid,
      );

      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.setProduct(productResult);
      logger.info({
        event: "PRODUCT_CREATED",
        productId: newProduct.product.dataValues.id,
        productUuid: newProduct.product.dataValues.uuid,
        productName: newProduct.product.dataValues.name,
      });

      return res
        .status(201)
        .json({ message: "success fully create product", data: newProduct });
    } catch (error: unknown) {
      logger.error({
        event: "PRODUCT_CREATED_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Product create failed:", message);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async getProductData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cacheKey = `product:${id}`;
      const cachedProduct = await CacheService.getProduct(cacheKey);

      if (cachedProduct) {
        return res.status(200).json({
          data: cachedProduct,
        });
      }
      // เช็คว่า id เป็น string จริง ๆ
      if (!id || typeof id !== "string") {
        return res.status(400).json({
          message: "Invalid product UUID",
        });
      }

      const result = await Product.findOne({
        where: {
          uuid: id,
          status: {
            [Op.in]: ["active", "inactive"], // ✅ ใช้ Op.in
          },
          deletedAt: { [Op.is]: null }, // ✅ เช็คว่าไม่ถูก soft delete
        },
        attributes: ["uuid", "tagId", "name", "detail", "price", "stock"],
        include: [
          {
            model: Category,
            as: "categories",
            attributes: ["uuid"],
            through: { attributes: [] }, // ✅ ไม่เอา field จาก join table
          },
          {
            model: ProductImage,
            as: "images",
            where: {
              deletedAt: { [Op.is]: null }, // ✅ ใช้ Op.is เพื่อเช็ค null
            },
            attributes: ["uuid", "path", "image", "status"],
            required: false, // ✅ ถ้าไม่มี image ก็ยังคืน product ได้
          },
        ],
      });

      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }

      return res.status(200).json({ data: result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Get product failed:", message);

      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }

  static async productImageStore(req: Request, res: Response) {
    const { id: productUuid } = req.params;
    if (typeof productUuid !== "string") {
      return res.status(400).json({
        message: "Invalid product UUID",
      });
    }
    const product = await validateCheckIdProduct(productUuid);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const relativeFolder = path.join("products", productUuid);
    const destinationFolder = path.join(
      process.cwd(),
      "uploads",
      relativeFolder,
    );

    let movedFiles: string[] = [];
    try {
      // เช็คก่อนสร้าง
      if (!fs.existsSync(destinationFolder)) {
        await fileService.createDirectory(destinationFolder);
      }

      const newProductImages = await ProductImage.sequelize!.transaction(
        async (t) => {
          const files = req.files as Express.Multer.File[];
          movedFiles = await fileService.moveFiles(files, destinationFolder);
          const images = await ProductImage.bulkCreate(
            movedFiles.map((newPath) => ({
              productId: product.id,
              path: relativeFolder,
              image: path.basename(newPath),
              status: "active",
            })),
            {
              transaction: t,
            },
          );
          return { images };
        },
      );
      const productWithRelations = await findProductWithRelations(productUuid);
      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.clearProduct(productUuid);
      await CacheService.setProduct(productResult);
      for (const img of newProductImages.images) {
        logger.info({
          event: `IMAGE_UPLOAD_${img.uuid}`,
          fieldname: img.image,
          patchImage: img.path,
          // size: req.file.size,
        });
      }

      return res.status(200).json({
        message: "Images uploaded successfully",
        newProductImages,
      });
    } catch (error: unknown) {
      logger.error({
        event: "IMAGE_UPLOAD_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      await fileService.removeFiles(movedFiles).catch(() => {});
      const message = error instanceof Error ? error.message : String(error);
      // console.error("❌ Product image upload failed:", message);
      return res
        .status(500)
        .json({ message: message || "Internal server error" });
    }
  }
  static async update(req: Request, res: Response) {
    const { name, detail, price, stock, categoryIds } = req.body;

    const { id: productUuid } = req.params;
    if (typeof productUuid !== "string") {
      return res.status(400).json({
        message: "Invalid product UUID",
      });
    }
    const productValidate = await validateCheckIdProduct(productUuid);
    const result = await validateProductUpdate({
      name,
      detail,
      price,
      stock,
      categoryIds,
    });

    if (!productValidate) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    if (result.errors.length > 0 || !result.data) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.errors,
      });
    }

    const data = result.data;

    const product = await Product.findOne({ where: { uuid: productUuid } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const oldData = product.toJSON();
    try {
      const updateProduct = await Product.sequelize?.transaction(async (t) => {
        await Product.update(
          {
            name: data.name,
            detail: data.detail,
            price: data.price,
            stock: data.stock,
          },
          { where: { uuid: productUuid }, transaction: t },
        );
        const categoryNewData = await getCategoryIdsFromUuids(data.categoryIds);
        const dataProductCategory = await ProductCategories.findAll({
          where: {
            productId: product.id,
          },
          attributes: ["id", "productId", "categoryId", "deletedAt"],
          paranoid: false,
          transaction: t,
        });
        //Category ที่ยังมีอยู่
        const activeCategories = dataProductCategory
          .filter(
            (item) =>
              categoryNewData.includes(item.categoryId) &&
              item.deletedAt === null,
          )
          .map((item) => item.categoryId);
        //  relation ที่ต้องลบ
        const notHaveDataObjects = dataProductCategory
          .filter(
            (item) =>
              item.deletedAt === null &&
              !categoryNewData.includes(item.categoryId),
          )
          .map((item) => ({
            id: item.id,
            productId: item.productId,
            categoryId: item.categoryId,
          }));
        // console.log("🔥 notHaveDataObjects:", notHaveDataObjects);
        // console.log("🔥 haveData:", activeCategories);
        const idsToRemove = notHaveDataObjects.map((o) => o.id);
        //  Category ใหม่ที่ต้องเพิ่ม
        const addNewCategoryData = categoryNewData.filter(
          (id) => !activeCategories.includes(id),
        );

        const oldDataCategory = notHaveDataObjects;
        const addDataCategory = addNewCategoryData.map((id) => ({
          categoryId: id,
        }));
        //  Delete relation เก่า

        if (idsToRemove.length > 0) {
          await ProductCategories.update(
            { deletedAt: new Date() },
            {
              where: {
                id: { [Op.in]: idsToRemove },
                productId: product.id,
              },
              transaction: t,
            },
          );
        }
        // Create relation ใหม่
        if (addNewCategoryData.length > 0) {
          for (const categoryId of addNewCategoryData) {
            const existing = await ProductCategories.findOne({
              where: { productId: product.id, categoryId },
              paranoid: false, // ดึงรวม soft deleted
              transaction: t,
            });
            if (existing) {
              if (existing.deletedAt) {
                // ✅ restore record ที่ถูก soft delete
                await existing.restore({ transaction: t });
              }
              // ถ้าไม่มี deletedAt → แสดงว่า active อยู่แล้ว → ไม่ต้องทำอะไร
            } else {
              // insert ใหม่
              await ProductCategories.create(
                { productId: product.id, categoryId },
                { transaction: t },
              );
            }
          }
        }

        return { oldDataCategory, addDataCategory };
      });
      const productWithRelations = await findProductWithRelations(productUuid);
      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.clearProduct(productUuid);
      await CacheService.setProduct(productResult);
      logger.info({
        event: "PRODUCT_UPDATE",
        product: {
          id: oldData.id,
          uuid: oldData.uuid,
          tagId: oldData.tagId,
        },
        changes: {
          fields: {
            name: {
              old: oldData.name,
              new: productWithRelations?.name,
            },
            price: {
              old: oldData.price,
              new: productWithRelations?.price,
            },
            stock: {
              old: oldData.stock,
              new: productWithRelations?.stock,
            },
          },

          categories: {
            added: [updateProduct?.addDataCategory],
            removed: [updateProduct?.oldDataCategory],
          },
        },
      });
      return res
        .status(200)
        .json({ message: "update data success ", data: productWithRelations });
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        console.error(
          error.errors.map((e) => ({
            message: e.message,
            path: e.path,
            value: e.value,
          })),
        );
      }
      logger.error({
        event: "PRODUCT_UPLOAD_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Product update failed:", message);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async deleteImage(req: Request, res: Response) {
    try {
      const { productId, imageId } = req.params;
      if (typeof productId !== "string") {
        return res.status(400).json({
          message: "Invalid product UUID",
        });
      }
      const productValidate = await validateCheckIdProduct(productId);
      if (!productValidate) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const image = await ProductImage.findOne({
        where: {
          uuid: imageId,
        },
      });
      if (!image || !productValidate) {
        return res.status(404).json({
          message: "Image not found",
        });
      }
      const filePath = path.join(`uploads/` + image.path, image.image);
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.warn("⚠️ File not found:", filePath, err);
        // ไม่ต้อง rollback DB → แค่แจ้ง warning
      }
      // 2. ลบ DB
      await ProductImage.sequelize!.transaction(async (t) => {
        await image.destroy({
          transaction: t,
        });
        return;
      });
      const productWithRelations = await findProductWithRelations(productId);
      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.clearProduct(productId);
      await CacheService.setProduct(productResult);

      logger.info({
        event: "DELETE_PRODUCT_IMAGE_SUCCESS",
        id: image.id,
        uuid: image.uuid,
        path: image.path,
        image: image.image,
      });
      return res
        .status(200)
        .json({ message: "Image deleted successfully", id: imageId });
    } catch (error: unknown) {
      logger.error({
        event: "DELETE_PRODUCT_IMAGE_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Product image delete failed:", message);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async updateStatus(req: Request, res: Response) {
    const { id: productUuid } = req.params;
    if (typeof productUuid !== "string") {
      return res.status(400).json({
        message: "Invalid product UUID",
      });
    }
    const productUuidCheck = await productIdExist(productUuid);
    if (!productUuidCheck) {
      return res.status(404).json({ message: "Product not found" });
    }
    const { status } = req.body;
    const result = await validateProductUpdateStatus({ status });
    if (result.errors.length > 0 || !result.data) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.errors,
      });
    }
    const oldProduct = await Product.findOne({
      where: { uuid: productUuid },
      attributes: ["id", "uuid", "status"],
    });
    try {
      await Product.sequelize!.transaction(async (t) => {
        await Product.update(
          { status: result.data.status },
          {
            where: { uuid: productUuid }, // ✅ ใช้ค่า id จริง
            transaction: t,
          },
        );
      });
      const productWithRelations = await findProductWithRelations(productUuid);
      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.clearProduct(productUuid);
      await CacheService.setProduct(productResult);

      logger.info({
        event: "PRODUCT_CHANGE_STATUS_SUCCESS",
        product: {
          uuid: productResult?.uuid,
          old: {
            status: oldProduct?.status,
          },
          new: {
            status: productResult?.status,
          },
        },
      });
      return res.status(200).json({
        message: "Products status updated successfully",
        data: productResult,
      });
    } catch (error: unknown) {
      logger.error({
        event: "PRODUCT_CHANGE_STATUS_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Product status update failed:", message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  static async destroy(req: Request, res: Response) {
    const { id: productUuid } = req.params;
    if (typeof productUuid !== "string") {
      return res.status(400).json({
        message: "Invalid product UUID",
      });
    }
    // const productUuidCheck = await productIdExist(productUuid);
    const product = await Product.findOne({ where: { uuid: productUuid } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let filesToDelete: string[] = [];
    try {
      const result = await Product.sequelize!.transaction(async (t) => {
        const images = await ProductImage.findAll({
          where: { productId: product.id },
          attributes: ["id", "uuid", "image", "path"],
          transaction: t,
        });

        // ดึง categories ก่อนลบ
        const categories = await ProductCategories.findAll({
          where: { productId: product.id },
          attributes: ["id", "productId", "categoryId"],
          transaction: t,
        });

        filesToDelete = images.map((image) =>
          path.join(process.cwd(), "uploads", image.path, image.image),
        );
        // ลบลูกก่อนพ่อ ทั้งหมดอยู่ใน transaction เดียว
        await ProductImage.destroy({
          where: { productId: product.id },
          transaction: t,
        });
        await ProductCategories.destroy({
          where: { productId: product.id },
          transaction: t,
        });
        await product.destroy({ transaction: t });

        return { images, categories };
      });

      // ลบไฟล์จริงหลัง DB commit สำเร็จ (fail ตรงนี้ไม่กระทบความถูกต้องของ DB)
      await Promise.all(
        filesToDelete.map(async (filePath) => {
          try {
            await fs.promises.unlink(filePath);
            console.log("✅ ลบไฟล์สำเร็จ:", filePath);
          } catch (err) {
            console.warn("⚠️ ลบไฟล์ไม่สำเร็จ:", filePath, err);
          }
        }),
      );
      await CacheService.clearProductList();
      await CacheService.clearProduct(productUuid);
      logger.info({
        event: "PRODUCT_DELETE_SUCCESS",
        product: {
          id: product.id,
          uuid: product.uuid,
          tagId: product.tagId,
        },
        categories: result.categories.map((c) => ({
          id: c.id,
          categoryId: c.categoryId,
        })),
        product_images: result.images.map((img) => ({
          id: img.id,
          uuid: img.uuid,
          image: img.image,
          path: img.path,
        })),
      });
      return res
        .status(200)
        .json({ message: "Delete product success", id: productUuid });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error({
        event: "PRODUCT_DELETE_ERROR",
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      console.error("❌ Product destroy failed:", message);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
  static async toggleImageVisibility(req: Request, res: Response) {
    const { productId, imageId } = req.params;
    const { status } = req.body;
    if (typeof productId !== "string") {
      return res.status(400).json({
        message: "Invalid product UUID",
      });
    }
    const productUuidCheck = await productIdExist(productId);
    if (!productUuidCheck) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (typeof imageId !== "string") {
      return res.status(400).json({
        message: "Validation error",
        errors: [{ field: "imageId", message: "Invalid image id" }],
      });
    }

    const parsed = await validateStatus(status);
    if (parsed.errors.length > 0 || !parsed.data) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.errors,
      });
    }

    const productImage = await ProductImage.findOne({
      where: { uuid: imageId },
      attributes: ["id", "uuid", "status"],
    });
    if (!productImage) {
      return res.status(404).json({ message: "Image not found" });
    }
    const oldStatus = productImage.status;
    try {
      await ProductImage.sequelize!.transaction(async (t) => {
        await productImage.update(
          { status: parsed.data.status },
          { transaction: t },
        );
      });
      const productWithRelations = await findProductWithRelations(productId);
      if (!productWithRelations) {
        // throw new Error("Product not found after create");
        return res.status(404).json({ message: "error find product" });
      }
      const productResult = ProductResource.toJSON(productWithRelations);
      await CacheService.clearProductList();
      await CacheService.clearProduct(productId);
      await CacheService.setProduct(productResult);
      logger.info({
        event: "PRODUCT_IMAGE_CHANGE_STATUS_SUCCESS",
        product_image: {
          id: productImage.id,
          uuid: productImage.uuid,
          old: { status: oldStatus },
          new: { status: productImage.status },
        },
      });

      return res.status(200).json({
        message: "Successfully updated image status",
        data: {
          imageId,
          oldStatus,
          newStatus: parsed.data.status,
        },
      });
    } catch (error) {
      logger.error({
        event: "PRODUCT_IMAGE_CHANGE_STATUS_FAILED",
        imageId,
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default ProductController;
