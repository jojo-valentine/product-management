import { Request, Response, NextFunction } from "express";
import multer from "multer";
import {
  MAX_PRODUCT_IMAGES,
  PRODUCT_IMAGE_FIELD,
  upload,
} from "../config/multer";
import { validateProductImageLimit } from "../validations/product";

const mapMulterError = (err: unknown) => {
  let message = err instanceof Error ? err.message : "Upload failed";
  let field = PRODUCT_IMAGE_FIELD;

  if (err instanceof multer.MulterError) {
    field = err.field || PRODUCT_IMAGE_FIELD;

    switch (err.code) {
      case "LIMIT_FILE_COUNT":
        message = `Maximum ${MAX_PRODUCT_IMAGES} files allowed`;
        break;
      case "LIMIT_FILE_SIZE":
        message = "Each image must not exceed 5MB";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        message = `Unexpected field. Use "${PRODUCT_IMAGE_FIELD}"`;
        break;
    }
  }

  return { field, message };
};

export const uploadProductImages = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  upload.array(PRODUCT_IMAGE_FIELD, MAX_PRODUCT_IMAGES)(req, res, (err) => {
    if (!err) return next();

    const { field, message } = mapMulterError(err);

    return res.status(400).json({
      message: "Validation error",
      errors: [{ field, message }],
    });
  });
};

export const uploadProductNewImages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const productUuid = req.params.id as string;
    const files = (req.files as Express.Multer.File[]) ?? [];

    const result = await validateProductImageLimit(productUuid, files.length);

    if (!result.exists) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!result.valid) {
      return res.status(400).json({
        message: "Validation error",
        errors: [
          {
            field: "images",
            message: `Product can have maximum ${MAX_PRODUCT_IMAGES} images`,
          },
        ],
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};