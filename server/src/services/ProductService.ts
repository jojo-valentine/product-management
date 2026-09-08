import { Op } from "sequelize";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";
async function productImageIdsExist(ids: string[]): Promise<boolean> {
  const productImage = await ProductImage.findOne({
    where: { uuid: { [Op.in]: ids } },
  });

  return !!productImage;
}
async function productIdExist(productUuid: string) {
  const product = await Product.findOne({
    where: {
      uuid: productUuid,
    },
    attributes: ["id"],
  });

  return product;
}

export { productImageIdsExist, productIdExist };
