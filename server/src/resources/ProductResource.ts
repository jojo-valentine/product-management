import Category from "../models/Category";
import Product from "../models/Product";
import ProductImage from "../models/ProductImage";


export class ProductResource {
  static toJSON(product: Product) {
    return {
      uuid: product.uuid,
      tagId: product.tagId,
      name: product.name,
      detail: product.detail,
      price: product.price,
      stock: product.stock,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,

      categories:
        product.categories?.map((c: Category) => ({
          uuid: c.uuid,
          name: c.name,
          status: c.status,
        })) ?? [],

      images:
        product.images?.map((i: ProductImage) => ({
          uuid: i.uuid,
          path: i.path,
          image: i.image,
          status: i.status,
          url: `/uploads/${i.path.replace(/\\/g, "/")}/${i.image}`,
        })) ?? [],
    };
  }
}
