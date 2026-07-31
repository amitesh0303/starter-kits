export interface AuthSession { accessToken: string; user: { id: string; email: string }; }
export interface AuthAdapter { signIn(email: string, password: string): Promise<AuthSession>; signOut(): Promise<void>; getSession(): Promise<AuthSession | null>; }
export function createFakeAuthAdapter(): AuthAdapter {
  let session: AuthSession | null = null;
  return {
    async signIn(_e, _p) { session = { accessToken: "fake", user: { id: "u1", email: "dev@example.com" } }; return session; },
    async signOut() { session = null; },
    async getSession() { return session; },
  };
}
