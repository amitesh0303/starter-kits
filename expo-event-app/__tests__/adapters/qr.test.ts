import { createFakeQRAdapter } from "@/adapters/qr-adapter";
describe("QR adapter (fake)", () => {
  it("scans and returns a code", async () => { const a = createFakeQRAdapter(); const code = await a.scan(); expect(code).not.toBeNull(); });
  it("generates a QR value", () => { const a = createFakeQRAdapter(); expect(a.generate("test")).toContain("test"); });
});
