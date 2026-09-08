import { Optional } from "sequelize";

export interface IProductImage {
  id: number;
  uuid: string;
  productId: number;
  path: string;
  image: string;
  updatedBy?: number | null;
  deletedAt?: Date | null;
  status: "active" | "inactive" | "archived";
}
export type ProductIProductImageCreationAttributes = Optional<
  IProductImage,
  "id" | "uuid" | "deletedAt"
>;
