import { describe, it, expect } from "vitest";
import * as policies from "@/domain/policies";

describe("remix-commerce-saas Policies", () => {
  it("exports policy functions", () => { expect(typeof policies.canViewOrder).toBe("function"); });
  it("denies empty userId", () => {
    const result = policies.canViewOrder({ userId: "" } as any, ...Array(10).fill({} as any));
    expect(result).toBe(false);
  });
});
