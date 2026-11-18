import { Optional } from "sequelize";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export interface IPayment {
  id: number;
  uuid: string;
  order_id: number;
  idempotency_key: string;
  payment_method: string;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  gateway_transaction_id: string | null;
  paid_at: Date | null;
}
export type IPaymentCreationAttributes = Optional<
  IPayment,
  "id" | "uuid" | "gateway_transaction_id" | "paid_at"
>;
export type PaymentEventType = "payment.succeeded" | "payment.failed";

export type WebhookProcessingStatus = "pending" | "processed" | "failed";

export interface IPaymentWebhookEvents {
  id: number;
  uuid: string;
  event_id: string;
  payment_id: number;
  event_type: PaymentEventType;
  payload: Record<string, unknown>;
  signature_valid: boolean;
  processing_status: WebhookProcessingStatus;
  processed_at: Date | null;
  error_message: string | null;
  // updatedAt: Date | null;
  // createdAt: Date | null;
}

export type IPaymentWebhookEventsCreationAttributes = Optional<
  IPaymentWebhookEvents,
  "id" | "uuid" | "processed_at" | "error_message"
>;
