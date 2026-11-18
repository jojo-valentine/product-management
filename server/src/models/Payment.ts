import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import {
  IPayment,
  IPaymentCreationAttributes,
  PaymentStatus,
} from "../types/IPayment";

class Payment
  extends Model<IPayment, IPaymentCreationAttributes>
  implements IPayment
{
  declare id: number;
  declare uuid: string;
  declare order_id: number;
  declare idempotency_key: string;
  declare payment_method: string;
  declare amount: number;
  declare currency: string;
  declare status: PaymentStatus;
  declare gateway_transaction_id: string | null;
  declare paid_at: Date | null;
  declare readonly updatedAt: Date;
  declare readonly createdAt: Date;
}

Payment.init(
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
    order_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    idempotency_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "THB",
    },
    status: {
      type: DataTypes.ENUM("pending", "succeeded", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },
    gateway_transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  },
);

export default Payment;
