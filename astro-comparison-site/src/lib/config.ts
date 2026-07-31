export interface SiteConfig {
  adsenseClientId: string | null;
  analyticsId: string | null;
  isAdsenseEnabled: boolean;
  isAnalyticsEnabled: boolean;
}

const ADSENSE_PLACEHOLDER = 'ca-pub-XXXXXXXXXXXXXXXX';
const ANALYTICS_PLACEHOLDER = 'G-XXXXXXXXXX';

function isValidAdsenseId(value: string | undefined): boolean {
  if (!value) return false;
  if (value === ADSENSE_PLACEHOLDER) return false;
  return value.startsWith('ca-pub-') && value.length > 7;
}

function isValidAnalyticsId(value: string | undefined): boolean {
  if (!value) return false;
  if (value === ANALYTICS_PLACEHOLDER) return false;
  return value.startsWith('G-') && value.length > 2;
}

export function loadConfig(): SiteConfig {
  const adsenseRaw = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.PUBLIC_ADSENSE_CLIENT_ID;
  const analyticsRaw = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.PUBLIC_ANALYTICS_ID;

  const adsenseClientId = isValidAdsenseId(adsenseRaw) ? adsenseRaw! : null;
  const analyticsId = isValidAnalyticsId(analyticsRaw) ? analyticsRaw! : null;

  return {
    adsenseClientId,
    analyticsId,
    isAdsenseEnabled: adsenseClientId !== null,
    isAnalyticsEnabled: analyticsId !== null,
  };
}
