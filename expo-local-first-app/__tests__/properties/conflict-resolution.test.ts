import * as fc from "fast-check";
import { needsSync, isValidNoteTitle } from "@/domain/policies";
import { Note } from "@/domain/entities";
describe("Property: Sync invariants", () => {
  it("note with no syncedAt always needs sync", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 100 }), (title) => {
      const n: Note = { id: "x", title, content: "", tags: [], createdAt: "", updatedAt: "2024-01-01T00:00:00Z", syncedAt: null, deleted: false };
      expect(needsSync(n)).toBe(true);
    }), { numRuns: 150 });
  });
  it("valid titles are 1-200 chars", () => {
    fc.assert(fc.property(fc.string({ minLength: 1, maxLength: 200 }), (title) => {
      expect(isValidNoteTitle(title)).toBe(true);
    }), { numRuns: 150 });
  });
});
