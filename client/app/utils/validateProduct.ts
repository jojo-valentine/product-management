import {
  productEditForm,
  productEditFormError,
  productForm,
  productFormError,
} from "../types/product";
import { z } from "zod";

export const productSchema = {
  create: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(255, "Product name must not exceed 255 characters"),

    detail: z
      .string()
      .trim()
      .min(1, "Product detail is required")
      .max(3000, "Product detail must not exceed 3000 characters"),

    price: z
      .string()
      .trim()
      .min(1, "Price is required")
      .refine((value) => !isNaN(Number(value)), {
        message: "Price must be a number",
      })
      .refine((value) => Number(value) >= 0, {
        message: "Price must be greater than or equal to 0",
      }),

    stock: z
      .string()
      .trim()
      .min(1, "Stock is required")
      .refine((value) => !isNaN(Number(value)), {
        message: "Stock must be a number",
      })
      .refine((value) => Number(value) >= 0, {
        message: "Stock must be greater than or equal to 0",
      }),

    status: z.enum(["active", "inactive"]),

    categoryIds: z
      .array(z.string().uuid())
      .min(1, "Please select at least one category"),

    images: z
      .array(z.instanceof(File))
      .max(10, "You can upload up to 10 images"),
  }),
  update: z
    .object({
      name: z.string().trim().min(1, "Product name is required").max(255),
      detail: z.string().trim().min(1, "Product detail is required").max(3000),
      price: z.number().min(0, "Price must be greater than or equal to 0"),
      stock: z.number().min(0, "Stock must be greater than or equal to 0"),

      categoryIds: z
        .array(z.string().uuid())
        .min(1, "Please select at least one category"),
    })
    .partial(),
};

export function validateForm(formProduct: productForm): productFormError {
  const result = productSchema.create.safeParse(formProduct);

  const errors: productFormError = {
    name: "",
    detail: "",
    price: "",
    stock: "",
    status: "",
    categoryIds: "",
    images: "",
  };
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof productFormError;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
  }
  return errors;
}
export function validateFormEdit(
  formProduct: productEditForm,
): productEditFormError {
  const result = productSchema.update.safeParse(formProduct);
  const errors: productEditFormError = {
    name: "",
    detail: "",
    price: "",
    stock: "",
    categoryIds: "",
  };
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof productEditFormError;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
  }
  return errors;
}
