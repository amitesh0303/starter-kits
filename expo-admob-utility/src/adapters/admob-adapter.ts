/**
 * AdMob adapter with fake implementation for testing.
 */

export interface AdMobAdapter {
  showBanner(): Promise<void>;
  showInterstitial(): Promise<boolean>;
  isAdFree(): boolean;
}

export function createFakeAdMobAdapter(): AdMobAdapter {
  let adFree = false;

  return {
    async showBanner(): Promise<void> {
      // Fake: no-op
    },
    async showInterstitial(): Promise<boolean> {
      if (adFree) return false;
      return true; // Fake: always shows
    },
    isAdFree(): boolean {
      return adFree;
    },
  };
}
