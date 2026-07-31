export interface CustomerSession { accessToken: string; customer: { id: string; email: string; firstName: string }; }
export interface AuthAdapter { signIn(email: string, password: string): Promise<CustomerSession>; signOut(): Promise<void>; getSession(): Promise<CustomerSession | null>; }
export function createFakeAuthAdapter(): AuthAdapter {
  let session: CustomerSession | null = null;
  return { async signIn(_e, _p) { session = { accessToken: "fake", customer: { id: "c1", email: "dev@example.com", firstName: "Dev" } }; return session; }, async signOut() { session = null; }, async getSession() { return session; } };
}
