import { describe, it, expect } from "vitest";
import * as policies from "@/domain/policies";

describe("react-admin-saas Policies", () => {
  it("exports policy functions", () => {
    expect(typeof policies.canViewContact).toBe("function");
  });
  it("denies access with empty userId", () => {
    const result = policies.canViewContact({ userId: "", role: "user" } as any, {} as any);
    expect(result).toBe(false);
  });
});
