import Category from "../models/Category";

export class CategoryResource {
  static toJSON(product: Category) {
    return {
      uuid: product.uuid,
      tagId: product.tagId,
      name: product.name,
      description: product.description,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
