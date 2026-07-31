export interface Habit { id: string; userId: string; name: string; frequency: "daily" | "weekly"; targetCount: number; color: string; createdAt: string; }
export interface Workout { id: string; userId: string; type: string; durationMinutes: number; caloriesBurned: number; startedAt: string; completedAt: string | null; }
export interface HealthMetric { id: string; userId: string; type: "steps" | "heartRate" | "sleep" | "calories"; value: number; unit: string; recordedAt: string; }
export interface Streak { habitId: string; currentStreak: number; longestStreak: number; lastCompletedAt: string | null; }
export type PendingActionState = "pending" | "syncing" | "applied" | "conflict" | "failed" | "cancelled";
export interface PendingAction { id: string; kind: string; payload: Record<string, unknown>; state: PendingActionState; attempts: number; createdAt: string; updatedAt: string; }
