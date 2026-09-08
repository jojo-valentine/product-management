import z from "zod";

// ✅ Category
export const CategorySchema = {
  create: z.object({
    name: z.string().min(1, "Category name is required").max(3000, "Category too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(3000, "Description too long"),
    status: z
      .preprocess((val) => {
        if (val === "true" || val === "1") return true;
        if (val === "false" || val === "0") return false;
        return val;
      }, z.boolean())
      .default(true),
  }),

  update: z.object({
    // id: z.string().uuid("Invalid UUID"),
    name: z.string().min(1, "Category name is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(3000, "Description too long"),
  }),
  change: z.object({
    status: z
      .preprocess((val) => {
        if (val === "true" || val === "1") return true;
        if (val === "false" || val === "0") return false;
        return val;
      }, z.boolean())
      .default(true),
  }),
};
export const IdParamSchema = z.object({
  id: z.string().uuid("Invalid UUID"),
});
