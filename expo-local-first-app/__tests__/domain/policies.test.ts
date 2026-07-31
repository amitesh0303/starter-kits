import { needsSync, detectConflict, isValidNoteTitle, isValidNoteContent, pendingSyncCount } from "@/domain/policies";
import { Note } from "@/domain/entities";
describe("Conflict resolution policies", () => {
  const baseNote: Note = { id: "n1", title: "Test", content: "Hi", tags: [], createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z", syncedAt: "2024-01-01T00:00:00Z", deleted: false };
  it("detects need for sync", () => {
    expect(needsSync(baseNote)).toBe(false);
    expect(needsSync({ ...baseNote, updatedAt: "2024-06-01T00:00:00Z" })).toBe(true);
    expect(needsSync({ ...baseNote, syncedAt: null })).toBe(true);
  });
  it("detects conflicts", () => {
    const local = { ...baseNote, updatedAt: "2024-06-01T00:00:00Z" };
    const remote = { ...baseNote, updatedAt: "2024-06-02T00:00:00Z" };
    expect(detectConflict(local, remote)).toBe(true);
  });
  it("validates title", () => { expect(isValidNoteTitle("Hi")).toBe(true); expect(isValidNoteTitle("")).toBe(false); expect(isValidNoteTitle("a".repeat(201))).toBe(false); });
  it("validates content size", () => { expect(isValidNoteContent("short")).toBe(true); expect(isValidNoteContent("a".repeat(50001))).toBe(false); });
  it("counts pending syncs", () => {
    const notes = [baseNote, { ...baseNote, id: "n2", syncedAt: null }];
    expect(pendingSyncCount(notes)).toBe(1);
  });
});
