import { DataTypes, QueryInterface, Sequelize } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("payment_webhook_events", {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
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
        references: {
          model: "payments",
          key: "id",
        },
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

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });
  },
  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("payment_webhook_events");
  },
};
