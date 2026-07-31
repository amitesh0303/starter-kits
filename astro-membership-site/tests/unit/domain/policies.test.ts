import { describe, it, expect } from "vitest";
import * as policies from "@/domain/policies";

describe("astro-membership-site Policies", () => {
  it("exports policy functions", () => { expect(typeof policies.canReadArticle).toBe("function"); });
  it("denies empty userId", () => {
    const result = policies.canReadArticle({ userId: "" } as any, ...Array(10).fill({} as any));
    expect(result).toBe(false);
  });
});
