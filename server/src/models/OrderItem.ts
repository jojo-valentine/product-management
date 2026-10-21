import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { IOrderItem } from "../types";
import { OrderItemCreationAttributes } from "../types/IOrder";

class OrderItem
  extends Model<IOrderItem, OrderItemCreationAttributes>
  implements IOrderItem
{
  public id!: number;
  public uuid!: string;
  public orderId!: number;
  public productId!: number;
  public productName!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
OrderItem.init(
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
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    productId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    unitPrice: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true,
  },
);

export default OrderItem;
