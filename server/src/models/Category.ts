import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { ICategory } from "../types";
import { CategoriesCreationAttributes } from "../types/ICategory";

class Category
  extends Model<ICategory, CategoriesCreationAttributes>
  implements ICategory
{
  public id!: number;
  public uuid!: string;
  public tagId!: string;
  public name!: string;
  public description!: string | null;
  public status!: boolean;
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
    },
    tagId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
  },
);

export default Category;
