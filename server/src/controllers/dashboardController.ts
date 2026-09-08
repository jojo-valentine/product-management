import { Request, Response } from "express";
import Product from "../models/Product";
import Category from "../models/Category";

class dashboardController {
  static async dashboardStats(req: Request, res: Response) {
    try {
      const [products, categories] = await Promise.all([
        Product.count({
          where: {
            deletedAt: null,
          },
        }),

        Category.count({
          where: {
            deletedAt: null,
          },
        }),
      ]);

      return res.status(200).json({
        data: {
          products,
          categories,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? `Get data failed: ${error.message}`
          : `Get data failed: ${String(error)}`;

      return res.status(500).json({ message });
    }
  }
}

export default dashboardController;
