export interface AuthSession { accessToken: string; refreshToken: string; user: { id: string; email: string }; }
export interface AuthAdapter {
  signIn(email: string, password: string): Promise<AuthSession>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  isAuthenticated(): Promise<boolean>;
}

export function createFakeAuthAdapter(): AuthAdapter {
  let session: AuthSession | null = null;
  const fakeUser = { id: "fake-user-001", email: "dev@example.com" };
  return {
    async signIn(_email: string, _password: string) {
      session = { accessToken: "fake-token", refreshToken: "fake-refresh", user: fakeUser };
      return session;
    },
    async signOut() { session = null; },
    async getSession() { return session; },
    async isAuthenticated() { return session !== null; },
  };
}
