import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { IProductCategories } from "../types";
import { ProductCategoryCreationAttributes } from "../types/IProductCategories";
class ProductCategories
  extends Model<IProductCategories, ProductCategoryCreationAttributes>
  implements IProductCategories
{
  public id!: number;
  public uuid!: string;
  public productId!: number;
  public categoryId!: number;
  public deletedAt!: Date | null;
  //   public updatedAt!: Date | null;
}
ProductCategories.init(
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
    productId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },
    categoryId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "categories",
        key: "id",
      },
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "ProductCategories",
    tableName: "product_categories",
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
  },
);

export default ProductCategories;
