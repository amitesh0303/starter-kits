export interface SiteConfig {
  adsenseClientId: string | null;
  isAdsenseEnabled: boolean;
}

const ADSENSE_PLACEHOLDER = 'ca-pub-XXXXXXXXXXXXXXXX';

function isValidAdsenseId(value: string | undefined): boolean {
  if (!value) return false;
  if (value === ADSENSE_PLACEHOLDER) return false;
  return value.startsWith('ca-pub-') && value.length > 7;
}

export function loadConfig(): SiteConfig {
  const adsenseRaw = (import.meta as unknown as { env?: Record<string, string> }).env
    ?.PUBLIC_ADSENSE_CLIENT_ID;

  const adsenseClientId = isValidAdsenseId(adsenseRaw) ? adsenseRaw! : null;

  return {
    adsenseClientId,
    isAdsenseEnabled: adsenseClientId !== null,
  };
}
