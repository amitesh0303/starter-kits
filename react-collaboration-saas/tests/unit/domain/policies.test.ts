import { describe, it, expect } from "vitest";
import * as policies from "@/domain/policies";

describe("react-collaboration-saas Policies", () => {
  it("exports policy functions", () => {
    expect(typeof policies.canViewDocument).toBe("function");
  });
  it("denies access with empty userId", () => {
    const result = policies.canViewDocument({ userId: "", role: "user" } as any, {} as any);
    expect(result).toBe(false);
  });
});
