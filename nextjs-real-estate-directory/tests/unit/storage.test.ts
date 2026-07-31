import { describe, it, expect } from "vitest";
import { createStorageAdapter } from "@/lib/server/storage";

describe("Storage Adapter", () => {
  const storage = createStorageAdapter();

  it("generates upload URL", async () => {
    const result = await storage.getUploadUrl("test-image.jpg");
    expect(result.url).toContain("https://");
    expect(result.key).toBeDefined();
  });

  it("generates public URL for key", () => {
    const url = storage.getPublicUrl("images/test.jpg");
    expect(url).toContain("test.jpg");
  });
});
