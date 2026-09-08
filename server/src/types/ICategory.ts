import { Optional } from "sequelize";

export interface ICategory {
  id?: number;
  uuid?: string;
  tagId?: string;
  name: string;
  description: string | null;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
export type CategoriesCreationAttributes = Optional<ICategory, "id" | "uuid">;
