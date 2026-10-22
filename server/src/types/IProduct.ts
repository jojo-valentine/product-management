import { Optional } from "sequelize";
import { IProductImage } from "./IProductImage";
import { ICategory } from "./ICategory";

export interface IProduct {
  id: number;
  uuid: string;
  tagId: string;
  name: string;
  detail: string;
  price: number;
  stock: number;
  updatedBy?: number | null;
  deletedAt?: Date | null;
  updatedAt?: Date | null;
  createdAt?: Date | null;
  status: "active" | "inactive" | "archived"; // ✅ ใช้ status แทน type
  images?: IProductImage[];
  categories?: ICategory[];
}

export type ProductCreationAttributes = Optional<IProduct, "id" | "uuid">;
// export type ProductUpdateStatusAttributes = Optional<IProduct, "id" | "uuid">;
