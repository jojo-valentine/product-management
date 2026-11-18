import { DataTypes, QueryInterface, Sequelize } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED,
      },

      uuid: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
      },

      order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "orders",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },

      idempotency_key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },

      payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "THB",
      },

      status: {
        type: DataTypes.ENUM("pending", "succeeded", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },

      gateway_transaction_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      paid_at: {
        type: DataTypes.DATE,
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
    await queryInterface.dropTable("payments");
  },
};
