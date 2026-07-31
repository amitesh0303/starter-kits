import * as fc from "fast-check";
import { canShowInterstitial } from "@/domain/policies";
import { AdConfig } from "@/domain/entities";

describe("Property: Ad frequency bounds", () => {
  const baseConfig: AdConfig = {
    bannerId: "b1",
    interstitialId: "i1",
    interstitialCooldownSec: 60,
    adsDisabled: false,
  };

  it("never shows ads when disabled regardless of timing", () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date(2020, 0, 1), max: new Date(2030, 0, 1) }),
        (date) => {
          const disabledConfig = { ...baseConfig, adsDisabled: true };
          expect(canShowInterstitial(disabledConfig, date.toISOString())).toBe(false);
        }
      ),
      { numRuns: 150 }
    );
  });

  it("always allows first show (null lastShownAt)", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3600 }),
        (cooldown) => {
          const config = { ...baseConfig, interstitialCooldownSec: cooldown };
          expect(canShowInterstitial(config, null)).toBe(true);
        }
      ),
      { numRuns: 150 }
    );
  });
});
