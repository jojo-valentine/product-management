import { Op } from "sequelize";
import { Category, Product, ProductImage } from "../models/Associations";

type SearchProductsInput = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string[];
  limit?: number;
};

export default class ProductAssistantService {
  static async searchProducts({
    search,
    minPrice,
    maxPrice,
    categoryIds = [],
    limit = 5,
  }: SearchProductsInput) {
    const where: any = {
      status: "active",
      deletedAt: null,
    };

    if (search?.trim()) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search.trim()}%` } },
        { detail: { [Op.like]: `%${search.trim()}%` } },
        { tagId: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};

      if (minPrice !== undefined) {
        where.price[Op.gte] = minPrice;
      }

      if (maxPrice !== undefined) {
        where.price[Op.lte] = maxPrice;
      }
    }

    const products = await Product.findAll({
      where,
      limit: Math.min(limit, 10),
      order: [["createdAt", "DESC"]],
      attributes: [
        "uuid",
        "tagId",
        "name",
        "detail",
        "price",
        "stock",
        "createdAt",
      ],
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["uuid", "name"],
          through: { attributes: [] },
          required: categoryIds.length > 0,
          ...(categoryIds.length > 0 && {
            where: {
              uuid: { [Op.in]: categoryIds },
              status: true,
              deletedAt: null,
            },
          }),
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["uuid", "path", "image"],
          required: false,
          where: {
            status: "active",
            deletedAt: null,
          },
        },
      ],
    });

    return products.map((product) => product.toJSON());
  }

  static async getProductDetail(productUuid: string) {
    const product = await Product.findOne({
      where: {
        uuid: productUuid,
        status: "active",
        deletedAt: null,
      },
      attributes: ["uuid", "tagId", "name", "detail", "price", "stock"],
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["uuid", "name"],
          through: { attributes: [] },
        },
        {
          model: ProductImage,
          as: "images",
          attributes: ["uuid", "path", "image"],
          required: false,
          where: {
            status: "active",
            deletedAt: null,
          },
        },
      ],
    });

    return product?.toJSON() ?? null;
  }

  static async checkStock(productUuid: string) {
    const product = await Product.findOne({
      where: {
        uuid: productUuid,
        deletedAt: null,
      },
      attributes: ["uuid", "name", "stock", "status"],
    });

    if (!product) {
      return null;
    }

    return {
      productUuid: product.uuid,
      name: product.name,
      stock: product.stock,
      status: product.status,
      available: product.status === "active" && product.stock > 0,
    };
  }
}
