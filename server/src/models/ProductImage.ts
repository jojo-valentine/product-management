import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { IProductImage } from "../types";
import { ProductIProductImageCreationAttributes } from "../types/IProductImage";

class ProductImage
  extends Model<IProductImage, ProductIProductImageCreationAttributes>
  implements IProductImage
{
  public id!: number;
  public uuid!: string;
  public productId!: number;
  public path!: string;
  public image!: string;
  public updatedBy!: number;
  public deletedAt!: Date | null;
  public status!: "active" | "inactive" | "archived";
}

ProductImage.init(
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
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "archived"),
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "ProductImage",
    tableName: "product_images",
    timestamps: true,
    paranoid: true,
    deletedAt: "deletedAt",
  },
);

export default ProductImage;
