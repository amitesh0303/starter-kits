export interface AuthSession { userId: string; token: string; }
export interface AuthAdapter { signIn(token: string): Promise<AuthSession>; signOut(): Promise<void>; getSession(): Promise<AuthSession | null>; }
export function createFakeAuthAdapter(): AuthAdapter {
  let session: AuthSession | null = null;
  return {
    async signIn(_token) { session = { userId: "fake-user-001", token: "fake-token" }; return session; },
    async signOut() { session = null; },
    async getSession() { return session; },
  };
}
