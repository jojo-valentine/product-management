// repositories/productRepository.ts
import Product from "../models/Product";
import Category from "../models/Category";
import ProductImage from "../models/ProductImage";

export async function findProductWithRelations(uuid: string) {
  return Product.findOne({
    where: { uuid },
    attributes: [
      "uuid",
      "tagId",
      "name",
      "detail",
      "price",
      "stock",
      "status",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: Category,
        as: "categories",
        attributes: ["uuid", "name", "status"],
        through: { attributes: [] },
      },
      {
        model: ProductImage,
        as: "images",
        attributes: ["uuid", "path", "image", "status"],
      },
    ],
  });
}
