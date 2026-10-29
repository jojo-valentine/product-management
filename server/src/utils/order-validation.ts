
export type CreateOrderItemInput = {
  productUuid: string;
  quantity: number;
};

export function validateOrderInput(
  customerName: string,
  customerPhone: string,
  items: CreateOrderItemInput[],
): string | null {
  if (!customerName.trim() || !customerPhone.trim()) {
    return "Customer name and phone are required";
  }

  if (!Array.isArray(items) || items.length === 0) {
    return "Order items are required";
  }

  for (const item of items) {
    if (
      !item.productUuid ||
      !Number.isInteger(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      return "Invalid order item";
    }
  }

  return null;
}
