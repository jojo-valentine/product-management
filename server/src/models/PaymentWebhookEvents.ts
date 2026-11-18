import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import {
  IPaymentWebhookEvents,
  IPaymentWebhookEventsCreationAttributes,
  PaymentEventType,
  WebhookProcessingStatus,
} from "../types/IPayment";

class PaymentWebhookEvents
  extends Model<IPaymentWebhookEvents, IPaymentWebhookEventsCreationAttributes>
  implements IPaymentWebhookEvents
{
  declare id: number;
  declare uuid: string;
  declare event_id: string;
  declare payment_id: number;
  declare event_type: PaymentEventType;
  declare payload: Record<string, unknown>;
  declare signature_valid: boolean;
  declare processing_status: WebhookProcessingStatus;
  declare processed_at: Date | null;
  declare error_message: string | null;
  declare readonly updatedAt: Date;
  declare readonly createdAt: Date;
}

PaymentWebhookEvents.init(
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
    event_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    payment_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    event_type: {
      type: DataTypes.ENUM("payment.succeeded", "payment.failed"),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    signature_valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    processing_status: {
      type: DataTypes.ENUM("pending", "processed", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },

    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "PaymentWebhookEvents",
    tableName: "payment_webhook_events",
    timestamps: true,
  },
);

export default PaymentWebhookEvents;
