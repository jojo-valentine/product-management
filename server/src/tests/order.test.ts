
import { describe, it, expect } from "vitest";

function calculateTotal(
  items: { unitPrice: number; quantity: number }[],
): number {
  return items.reduce(
    (total, item) => total + item.unitPrice * item.quantity,
    0,
  );
}

describe("calculateTotal", () => {
  it("คำนวณยอดรวมสินค้า 1 รายการได้ถูกต้อง", () => {
    expect(calculateTotal([{ unitPrice: 100, quantity: 3 }])).toBe(300);
  });

  it("คำนวณยอดรวมสินค้าหลายรายการได้ถูกต้อง", () => {
    expect(
      calculateTotal([
        { unitPrice: 100, quantity: 2 },
        { unitPrice: 50, quantity: 3 },
      ]),
    ).toBe(350);
  });

  it("คืนค่า 0 เมื่อไม่มีสินค้า", () => {
    expect(calculateTotal([])).toBe(0);
  });
});
