/**
 * SecureStore wrapper for session tokens and sensitive values.
 */

import * as SecureStore from "expo-secure-store";

const SESSION_TOKEN_KEY = "session_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface TokenStore {
  getSessionToken(): Promise<string | null>;
  setSessionToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string): Promise<void>;
  clearTokens(): Promise<void>;
}

/**
 * Real implementation using expo-secure-store.
 */
export const secureTokenStore: TokenStore = {
  async getSessionToken(): Promise<string | null> {
    return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
  },

  async setSessionToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

/**
 * Fake implementation for testing/development without real SecureStore.
 */
export function createFakeTokenStore(): TokenStore {
  const store = new Map<string, string>();

  return {
    async getSessionToken(): Promise<string | null> {
      return store.get(SESSION_TOKEN_KEY) ?? null;
    },
    async setSessionToken(token: string): Promise<void> {
      store.set(SESSION_TOKEN_KEY, token);
    },
    async getRefreshToken(): Promise<string | null> {
      return store.get(REFRESH_TOKEN_KEY) ?? null;
    },
    async setRefreshToken(token: string): Promise<void> {
      store.set(REFRESH_TOKEN_KEY, token);
    },
    async clearTokens(): Promise<void> {
      store.delete(SESSION_TOKEN_KEY);
      store.delete(REFRESH_TOKEN_KEY);
    },
  };
}
