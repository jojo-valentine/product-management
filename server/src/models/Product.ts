import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { IProduct } from "../types";
import { ProductCreationAttributes } from "../types/IProduct";
import ProductImage from "./ProductImage";
import Category from "./Category";

class Product
  extends Model<IProduct, ProductCreationAttributes>
  implements IProduct
{
  public id!: number;
  public uuid!: string;
  public tagId!: string;
  public name!: string;
  public detail!: string;
  public price!: number;
  public stock!: number;
  public updatedBy!: number | null;
  public deletedAt!: Date | null;
  public createdAt!: Date | null;
  public updatedAt!: Date | null;
  public status!: "active" | "inactive" | "archived";
  declare images?: ProductImage[];
  declare categories?: Category[];
}

Product.init(
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
    tagId: { type: DataTypes.STRING, allowNull: false },
    name: DataTypes.STRING,
    detail: DataTypes.STRING,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    updatedBy: DataTypes.INTEGER.UNSIGNED,
    deletedAt: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
  },
);

export default Product;
