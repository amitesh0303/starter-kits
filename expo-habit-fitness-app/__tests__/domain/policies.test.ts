import { habitCompletionPercent, isValidWorkoutDuration, estimateCalories, calculateStreakAfterCompletion } from "@/domain/policies";
import { Streak } from "@/domain/entities";
describe("Streak calculation", () => {
  it("calculates completion percent", () => { expect(habitCompletionPercent(5, 10)).toBe(50); expect(habitCompletionPercent(10, 10)).toBe(100); expect(habitCompletionPercent(15, 10)).toBe(100); });
  it("validates workout duration", () => { expect(isValidWorkoutDuration(30)).toBe(true); expect(isValidWorkoutDuration(0)).toBe(false); expect(isValidWorkoutDuration(601)).toBe(false); });
  it("estimates calories", () => { expect(estimateCalories(30, "low")).toBe(120); expect(estimateCalories(30, "high")).toBe(300); });
  it("increments streak on completion", () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const streak: Streak = { habitId: "h1", currentStreak: 3, longestStreak: 5, lastCompletedAt: yesterday };
    const updated = calculateStreakAfterCompletion(streak);
    expect(updated.currentStreak).toBe(4);
  });
  it("resets streak if gap > 1 day", () => {
    const oldDate = new Date(Date.now() - 5 * 86400000).toISOString();
    const streak: Streak = { habitId: "h1", currentStreak: 10, longestStreak: 10, lastCompletedAt: oldDate };
    const updated = calculateStreakAfterCompletion(streak);
    expect(updated.currentStreak).toBe(1);
  });
});
