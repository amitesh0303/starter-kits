export interface AuthSession { uid: string; email: string; token: string; }
export interface AuthAdapter { signIn(email: string, password: string): Promise<AuthSession>; signOut(): Promise<void>; getSession(): Promise<AuthSession | null>; }
export function createFakeAuthAdapter(): AuthAdapter {
  let session: AuthSession | null = null;
  return { async signIn(_e, _p) { session = { uid: "d1", email: "driver@example.com", token: "fake" }; return session; }, async signOut() { session = null; }, async getSession() { return session; } };
}
