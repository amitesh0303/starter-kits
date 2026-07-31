import { canShowInterstitial, canAccessTool, partitionTools, totalUsageDuration } from "@/domain/policies";
import { AdConfig, Tool, UsageRecord } from "@/domain/entities";

describe("Ad frequency policies", () => {
  const config: AdConfig = {
    bannerId: "banner-1",
    interstitialId: "inter-1",
    interstitialCooldownSec: 60,
    adsDisabled: false,
  };

  it("allows interstitial when no previous show", () => {
    expect(canShowInterstitial(config, null)).toBe(true);
  });

  it("blocks interstitial during cooldown", () => {
    const recentTime = new Date(Date.now() - 30000).toISOString();
    expect(canShowInterstitial(config, recentTime)).toBe(false);
  });

  it("allows interstitial after cooldown", () => {
    const oldTime = new Date(Date.now() - 120000).toISOString();
    expect(canShowInterstitial(config, oldTime)).toBe(true);
  });

  it("never shows ads when disabled", () => {
    const disabledConfig = { ...config, adsDisabled: true };
    expect(canShowInterstitial(disabledConfig, null)).toBe(false);
  });
});

describe("Tool access policies", () => {
  const freeTool: Tool = { id: "1", name: "Calculator", description: "Basic calc", category: "math", isPremium: false };
  const premiumTool: Tool = { id: "2", name: "Advanced Calc", description: "Premium", category: "math", isPremium: true };

  it("allows free tools for all users", () => {
    expect(canAccessTool(freeTool, false)).toBe(true);
    expect(canAccessTool(freeTool, true)).toBe(true);
  });

  it("blocks premium tools for free users", () => {
    expect(canAccessTool(premiumTool, false)).toBe(false);
  });

  it("allows premium tools for premium users", () => {
    expect(canAccessTool(premiumTool, true)).toBe(true);
  });

  it("partitions tools correctly", () => {
    const tools = [freeTool, premiumTool];
    const result = partitionTools(tools, false);
    expect(result.accessible).toHaveLength(1);
    expect(result.locked).toHaveLength(1);
  });
});

describe("Usage tracking", () => {
  it("calculates total usage duration", () => {
    const records: UsageRecord[] = [
      { id: "1", toolId: "calc", timestamp: "2024-01-01T00:00:00Z", durationMs: 1000 },
      { id: "2", toolId: "calc", timestamp: "2024-01-01T00:01:00Z", durationMs: 2000 },
      { id: "3", toolId: "other", timestamp: "2024-01-01T00:02:00Z", durationMs: 500 },
    ];
    expect(totalUsageDuration(records, "calc")).toBe(3000);
    expect(totalUsageDuration(records, "other")).toBe(500);
    expect(totalUsageDuration(records, "none")).toBe(0);
  });
});
