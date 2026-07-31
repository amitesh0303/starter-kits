import { describe, it, expect } from "vitest";
import { createDatabaseAdapter } from "@/lib/server/database";

describe("Database Adapter", () => {
  const db = createDatabaseAdapter();

  it("returns coupons with pagination", async () => {
    const result = await db.getCoupons(1, 10);
    expect(result.coupons).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });

  it("returns coupon by id", async () => {
    const coupon = await db.getCouponById("1");
    expect(coupon).not.toBeNull();
    expect(coupon!.code).toBe("SAVE20");
  });

  it("returns null for unknown id", async () => {
    const coupon = await db.getCouponById("nonexistent");
    expect(coupon).toBeNull();
  });

  it("returns stores", async () => {
    const stores = await db.getStores();
    expect(stores.length).toBeGreaterThan(0);
  });

  it("returns coupons by store", async () => {
    const result = await db.getCouponsByStore("techstore", 1, 10);
    expect(result.coupons.length).toBeGreaterThan(0);
    expect(result.coupons[0].store).toBe("techstore");
  });
});
