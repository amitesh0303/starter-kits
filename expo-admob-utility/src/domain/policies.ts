/**
 * Ad frequency and tool access policies.
 */

import { AdConfig, Tool, UsageRecord } from "./entities";

/**
 * Determines whether an interstitial ad can be shown based on cooldown.
 */
export function canShowInterstitial(
  config: AdConfig,
  lastShownAt: string | null
): boolean {
  if (config.adsDisabled) return false;
  if (!lastShownAt) return true;
  const elapsed = (Date.now() - new Date(lastShownAt).getTime()) / 1000;
  return elapsed >= config.interstitialCooldownSec;
}

/**
 * Determines whether a user can access a tool.
 * Premium tools require ad-free subscription.
 */
export function canAccessTool(tool: Tool, isPremiumUser: boolean): boolean {
  if (!tool.isPremium) return true;
  return isPremiumUser;
}

/**
 * Partitions tools into free and premium categories.
 */
export function partitionTools(
  tools: Tool[],
  isPremiumUser: boolean
): { accessible: Tool[]; locked: Tool[] } {
  const accessible: Tool[] = [];
  const locked: Tool[] = [];
  for (const tool of tools) {
    if (canAccessTool(tool, isPremiumUser)) {
      accessible.push(tool);
    } else {
      locked.push(tool);
    }
  }
  return { accessible, locked };
}

/**
 * Calculates total usage duration for a given tool.
 */
export function totalUsageDuration(records: UsageRecord[], toolId: string): number {
  return records
    .filter((r) => r.toolId === toolId)
    .reduce((sum, r) => sum + r.durationMs, 0);
}
