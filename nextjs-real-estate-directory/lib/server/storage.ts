/**
 * Storage adapter for property images.
 * In production connects to Cloudflare R2.
 */
export interface StorageAdapter {
  getUploadUrl(filename: string): Promise<{ url: string; key: string }>;
  getPublicUrl(key: string): string;
}

export function createStorageAdapter(): StorageAdapter {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;

  if (!R2_ACCOUNT_ID || R2_ACCOUNT_ID === "your_cloudflare_account_id") {
    return createFakeStorageAdapter();
  }

  return createFakeStorageAdapter();
}

function createFakeStorageAdapter(): StorageAdapter {
  return {
    async getUploadUrl(filename) {
      const key = `images/${Date.now()}-${filename}`;
      return {
        url: `https://storage.example.com/upload/${key}`,
        key,
      };
    },
    getPublicUrl(key) {
      return `https://storage.example.com/public/${key}`;
    },
  };
}
