/**
 * Message quota and conversation policies.
 */

import { UserProfile, UsageQuota } from "./entities";

/** Check if user can send a message based on quota. */
export function canSendMessage(profile: UserProfile): boolean {
  if (profile.tier === "premium") return true;
  return profile.messagesUsedToday < profile.dailyMessageLimit;
}

/** Get remaining messages for the day. */
export function remainingMessages(profile: UserProfile): number {
  if (profile.tier === "premium") return Infinity;
  return Math.max(0, profile.dailyMessageLimit - profile.messagesUsedToday);
}

/** Check if quota has been exceeded. */
export function isQuotaExceeded(quota: UsageQuota): boolean {
  return quota.used >= quota.dailyLimit;
}

/** Calculate quota usage percentage. */
export function quotaUsagePercent(quota: UsageQuota): number {
  if (quota.dailyLimit === 0) return 100;
  return Math.min(100, Math.round((quota.used / quota.dailyLimit) * 100));
}

/** Validate message content is not empty or too long. */
export function isValidMessage(content: string, maxLength: number = 4000): boolean {
  const trimmed = content.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength;
}
