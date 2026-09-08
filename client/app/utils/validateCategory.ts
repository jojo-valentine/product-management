import {
  categoryEdit,
  categoryEditFormError,
  errorCategory,
  formCategory,
  initialCategoryEditFormError,
  initialCategoryError,
} from "../types/category";

import { z } from "zod";

export const categorySchema = {
  create: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Category name is required")
      .max(255, "Category name must not exceed 255 characters"),

    description: z
      .string()
      .trim()
      .min(1, "Category detail is required")
      .max(3000, "Category detail must not exceed 3000 characters"),

    status: z
      .preprocess((val) => {
        if (val === "true" || val === "1") return true;
        if (val === "false" || val === "0") return false;
        return val;
      }, z.boolean())
      .default(true),
  }),
  update: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Category name is required")
        .max(255, "Category name must not exceed 255 characters"),

      description: z
        .string()
        .trim()
        .min(1, "Category detail is required")
        .max(3000, "Category detail must not exceed 3000 characters"),
    })
    .partial(),
};

export function validateForm(formCategory: formCategory): errorCategory {
  const result = categorySchema.create.safeParse(formCategory);

  const errors = initialCategoryError;
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof errorCategory;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
  }
  return errors;
}
export function validateFormEdit(
  formCategory: categoryEdit,
): categoryEditFormError {
  const result = categorySchema.update.safeParse(formCategory);
  const errors = initialCategoryEditFormError;
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof categoryEditFormError;
      if (!errors[field]) {
        errors[field] = issue.message;
      }
    });
  }
  return errors;
}
