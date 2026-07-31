export interface AdMobAdapter { showBanner(): Promise<void>; showInterstitial(): Promise<boolean>; }
export function createFakeAdMobAdapter(): AdMobAdapter { return { async showBanner() {}, async showInterstitial() { return true; } }; }
