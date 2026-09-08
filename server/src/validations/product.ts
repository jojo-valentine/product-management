import { Request, Response, NextFunction } from "express";
import z, { ZodSchema } from "zod";
import {
  categoryIdsExist,
  normalizeCategoryIds,
} from "../services/CategoryService";
import { error } from "node:console";
import Product from "../models/Product";
import { where } from "sequelize";
import ProductImage from "../models/ProductImage";
import { MAX_PRODUCT_IMAGES } from "../config/multer";

type ValidateSchema = {
  body?: ZodSchema; // สำหรับ req.body
  params?: ZodSchema; // สำหรับ req.params
  query?: ZodSchema; // สำหรับ req.query
};

type ValidationError = {
  field: string;
  message: string;
};
// ✅ Category
export const productSchema = {
  create: z.object({
    name: z
      .string()
      .min(1, "Category name is required")
      .max(3000, "Category too long"),
    detail: z
      .string()
      .min(1, "Detail is required")
      .max(3000, "Detail too long"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    stock: z.coerce
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock must be non-negative"),
    status: z.enum(["active", "inactive", "archived"]).default("active"),
    // categoryIds:  z
    //   .array(z.string().uuid())
    //   .nonempty("At least one category required"),
    // categoryIds: z.preprocess((val) => {
    //   // ถ้าส่งมาเป็น String เช่น "1,2,3" ให้จับมาแยกด้วยเครื่องหมาย ,
    //   if (typeof val === "string") {
    //     // ถ้าเป็น String ว่างให้ส่งกลับเป็น Array ว่าง []
    //     if (val.trim() === "") return [];

    //     // แยกข้อความแล้วแปลงสมาชิกแต่ละตัวให้เป็น Number
    //     return val.split(",").map((item) => Number(item.trim()));
    //   }
    //   return val;
    // }, z.array(z.number())),
    categoryIds: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return [];
        return typeof val === "string" ? [val] : val;
      }),
  }),
  changeStatus: z.object({
    status: z.enum(["active", "inactive", "archived"]).default("active"),
  }),
  update: z.object({
    name: z
      .string()
      .min(1, "Category name is required")
      .max(3000, "Category too long"),
    detail: z
      .string()
      .min(1, "Detail is required")
      .max(3000, "Detail too long"),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    stock: z.coerce
      .number()
      .int("Stock must be an integer")
      .min(0, "Stock must be non-negative"),

    categoryIds: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return [];
        return typeof val === "string" ? [val] : val;
      }),
  }),
};

export async function validateProduct(req: Request, res: Response) {
  const files = req.files;
  const errors: ValidationError[] = [];
  const parsed = productSchema.create.safeParse(req.body);
  // console.log(req.body, req.files);
  if (!parsed.success) {
    errors.push(
      ...parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
    return { errors, data: null };
  }
  // ✅ only check categoryIds existence if schema validation actually succeeded
  if (parsed.success) {
    // console.log(parsed.data.categoryIds);
    const exists = await categoryIdsExist(parsed.data.categoryIds);
    if (!exists) {
      errors.push({
        field: "categoryIds",
        message: "Some categoryIds do not exist",
      });
    }
  }

  if (req.multerError) {
    errors.push({
      field: req.multerError.field ?? "file", // ✅ ระบุ field ที่ error
      message: req.multerError.message,
    });
  }

  // 3. รวม error แล้วส่งทีเดียว ✅ อยู่นอก loop
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Validation error",
      errors,
    });
  }

  return {
    errors,
    data: parsed.success ? parsed.data : null,
  };
}
export async function validateStatus(status: string) {
  const errors: ValidationError[] = [];
  const parsed = productSchema.changeStatus.safeParse({ status });
  if (!parsed.success) {
    errors.push(
      ...parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
    return { errors, data: null };
  }

  return { errors: [], data: parsed.data };
}
export async function validateProductImages(req: Request, res: Response) {}

// export async function validateCreateProduct() {}
export async function validateCheckIdProduct(productUuid: string) {
  const product = await Product.findOne({
    where: {
      uuid: productUuid,
    },
    attributes: ["id"],
  });
  if (!product) {
    return null;
  }

  return product;
}

export const useValidation =
  (schema: ValidateSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const sections = ["body", "params", "query"] as const;
    let errors: ValidationError[] = [];

    // 2. loop เช็คทุก section ก่อน แล้วค่อย return error รวม
    for (const key of sections) {
      const currentSchema = schema[key];
      if (currentSchema) {
        const result = currentSchema.safeParse(req[key]);
        if (!result.success) {
          const zodErrors = result.error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          }));
          errors = [...errors, ...zodErrors];
        } else {
          (req as any)[key] = result.data; // ✅ clean data
        }
      }
    }
    // 1. handle multer error ก่อน
    if (req.multerError) {
      errors.push({
        field: req.multerError.field ?? "file", // ✅ ระบุ field ที่ error
        message: req.multerError.message,
      });
    }
    // 3. รวม error แล้วส่งทีเดียว ✅ อยู่นอก loop
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation error",
        errors,
      });
    }

    next();
  };

export const validateProductImageLimit = async (
  productId: string,
  newFileCount: number,
) => {
  const product = await Product.findOne({ where: { uuid: productId } });
  if (!product) {
    return { exists: false, valid: false, currentImageCount: 0 };
  }

  const currentImageCount = await ProductImage.count({
    where: { productId: product.id },
  });

  return {
    exists: true,
    valid: currentImageCount + newFileCount <= MAX_PRODUCT_IMAGES,
    currentImageCount,
  };
};

export async function validateProductUpdate(data: {
  name: string;
  detail: string;
  price: number;
  stock: number;
  categoryIds: string[];
}) {
  const errors: ValidationError[] = [];
  const newData = {
    name: data.name,
    detail: data.detail,
    price: data.price,
    stock: data.stock,
    categoryIds: normalizeCategoryIds(data.categoryIds), // ✅ array เสมอ
  };
  const parsed = productSchema.update.safeParse(newData);

  if (!parsed.success) {
    errors.push(
      ...parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
    return { errors, data: null };
  } else {
    const raw = normalizeCategoryIds(parsed.data.categoryIds);
    const exists = await categoryIdsExist(raw);
    if (!exists) {
      errors.push({
        field: "categoryIds",
        message: "Some categoryIds do not exist",
      });
    }
  }

  return { errors: [], data: parsed.data };
}

export async function validateProductUpdateStatus(data: { status: string }) {
  const errors: ValidationError[] = [];
  const parsed = productSchema.changeStatus.safeParse(data);

  if (!parsed.success) {
    errors.push(
      ...parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
    return { errors, data: null };
  }

  return { errors: [], data: parsed.data };
}
