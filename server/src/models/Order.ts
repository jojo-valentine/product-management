import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import { IOrder } from "../types";
import { OrderCreationAttributes } from "../types/IOrder";
class Order extends Model<IOrder, OrderCreationAttributes> implements IOrder {
  public id!: number;
  public uuid!: string;
  public orderNumber!: string;
  public customerName!: string;
  public customerPhone!: string;
  public totalAmount!: number;
  public orderStatus!: "pending" | "confirmed" | "cancelled";
  public paymentStatus!: "pending" | "paid" | "failed";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
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
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    orderStatus: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  },
);

export default Order;
