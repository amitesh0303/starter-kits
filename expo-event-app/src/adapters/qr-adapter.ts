export interface QRAdapter { scan(): Promise<string | null>; generate(data: string): string; }
export function createFakeQRAdapter(): QRAdapter {
  return { async scan() { return "550e8400-e29b-41d4-a716-446655440000"; }, generate(data) { return "qr://" + data; } };
}
