import { Habit, Streak } from "./entities";

/** Check if a habit is completed for today. */
export function isHabitCompletedToday(streak: Streak): boolean {
  if (!streak.lastCompletedAt) return false;
  const last = new Date(streak.lastCompletedAt);
  const today = new Date();
  return last.toDateString() === today.toDateString();
}

/** Calculate streak after completing a habit. */
export function calculateStreakAfterCompletion(streak: Streak): Streak {
  if (isHabitCompletedToday(streak)) return streak;
  const wasYesterday = streak.lastCompletedAt
    ? (new Date().getTime() - new Date(streak.lastCompletedAt).getTime()) < 2 * 24 * 60 * 60 * 1000
    : false;
  const newCurrent = wasYesterday ? streak.currentStreak + 1 : 1;
  return {
    ...streak,
    currentStreak: newCurrent,
    longestStreak: Math.max(streak.longestStreak, newCurrent),
    lastCompletedAt: new Date().toISOString(),
  };
}

/** Calculate completion percentage for a habit. */
export function habitCompletionPercent(completedCount: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  return Math.min(100, Math.round((completedCount / targetCount) * 100));
}

/** Validate workout duration. */
export function isValidWorkoutDuration(minutes: number): boolean {
  return minutes > 0 && minutes <= 600;
}

/** Calculate calories burned estimate. */
export function estimateCalories(durationMinutes: number, intensity: "low" | "medium" | "high"): number {
  const rates = { low: 4, medium: 7, high: 10 };
  return Math.round(durationMinutes * rates[intensity]);
}
