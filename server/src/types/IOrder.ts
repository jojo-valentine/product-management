import { Optional } from "sequelize";

export interface IOrder {
  id?: number;
  uuid?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  orderStatus: "pending" | "confirmed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt?: Date;
  updatedAt?: Date;
}
export type OrderCreationAttributes = Optional<IOrder, "id" | "uuid">;

export interface IOrderItem {
  id?: number;
  uuid?: string;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderItemCreationAttributes = Optional<IOrderItem, "id" | "uuid">;
