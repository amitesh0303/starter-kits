/**
 * Auth adapter wrapping Supabase Auth with fake default.
 */

import { Profile } from "../domain/entities";
import { TokenStore } from "../storage/secure-store";

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

export interface AuthAdapter {
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getProfile(): Promise<Profile | null>;
  isAuthenticated(): Promise<boolean>;
}

/**
 * Creates a fake auth adapter for development/testing.
 */
export function createFakeAuthAdapter(tokenStore: TokenStore): AuthAdapter {
  let currentSession: AuthSession | null = null;

  const fakeUser = {
    id: "fake-user-001",
    email: "dev@example.com",
  };

  const fakeProfile: Profile = {
    id: fakeUser.id,
    email: fakeUser.email,
    displayName: "Dev User",
    avatarUrl: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  return {
    async signIn(_email: string, _password: string): Promise<AuthSession> {
      const session: AuthSession = {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        user: fakeUser,
      };
      await tokenStore.setSessionToken(session.accessToken);
      await tokenStore.setRefreshToken(session.refreshToken);
      currentSession = session;
      return session;
    },

    async signUp(_email: string, _password: string): Promise<AuthSession> {
      const session: AuthSession = {
        accessToken: "fake-access-token",
        refreshToken: "fake-refresh-token",
        user: fakeUser,
      };
      await tokenStore.setSessionToken(session.accessToken);
      await tokenStore.setRefreshToken(session.refreshToken);
      currentSession = session;
      return session;
    },

    async signOut(): Promise<void> {
      await tokenStore.clearTokens();
      currentSession = null;
    },

    async getSession(): Promise<AuthSession | null> {
      if (currentSession) return currentSession;
      const token = await tokenStore.getSessionToken();
      if (token) {
        currentSession = {
          accessToken: token,
          refreshToken: (await tokenStore.getRefreshToken()) ?? "",
          user: fakeUser,
        };
        return currentSession;
      }
      return null;
    },

    async getProfile(): Promise<Profile | null> {
      const session = await this.getSession();
      if (!session) return null;
      return fakeProfile;
    },

    async isAuthenticated(): Promise<boolean> {
      const session = await this.getSession();
      return session !== null;
    },
  };
}
