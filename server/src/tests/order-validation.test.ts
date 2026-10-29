
import { describe, it, expect } from "vitest";
import { validateOrderInput } from "../utils/order-validation";

describe("validateOrderInput", () => {
  it("should pass valid order input", () => {
    expect(
      validateOrderInput("Jojo", "0812345678", [
        { productUuid: "product-123", quantity: 2 },
      ]),
    ).toBeNull();
  });

  it("should reject empty customer name", () => {
    expect(
      validateOrderInput("", "0812345678", [
        { productUuid: "product-123", quantity: 1 },
      ]),
    ).toBe("Customer name and phone are required");
  });

  it("should reject empty items", () => {
    expect(
      validateOrderInput("Jojo", "0812345678", []),
    ).toBe("Order items are required");
  });

  it("should reject quantity less than 1", () => {
    expect(
      validateOrderInput("Jojo", "0812345678", [
        { productUuid: "product-123", quantity: 0 },
      ]),
    ).toBe("Invalid order item");
  });
});
