import { Optional } from "sequelize";

export interface IProductCategories {
  id: number;
  uuid: string;
  productId: number;
  categoryId: number;
  deletedAt?: Date | null;
}
export type ProductCategoryCreationAttributes = Optional<
  IProductCategories,
  "id" | "uuid" | "deletedAt"
>;
