import { createFakeSyncAdapter } from "@/adapters/sync-adapter";
import { Note } from "@/domain/entities";
describe("Sync adapter (fake)", () => {
  it("pushes notes successfully", async () => {
    const a = createFakeSyncAdapter();
    const note: Note = { id: "n1", title: "T", content: "C", tags: [], createdAt: "", updatedAt: "", syncedAt: null, deleted: false };
    const r = await a.pushNotes([note]);
    expect(r.synced).toContain("n1");
    expect(r.conflicts).toHaveLength(0);
  });
  it("pulls notes", async () => { const a = createFakeSyncAdapter(); const r = await a.pullNotes(null); expect(Array.isArray(r)).toBe(true); });
});
