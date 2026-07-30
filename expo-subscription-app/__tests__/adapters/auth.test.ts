import { createFakeAuthAdapter } from "@/adapters/auth-adapter";
import { createFakeTokenStore } from "@/storage/secure-store";

describe("Auth adapter (fake)", () => {
  it("signs in and stores session", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    const session = await auth.signIn("test@test.com", "password");
    expect(session.accessToken).toBe("fake-access-token");
    expect(session.user.email).toBe("dev@example.com");

    const stored = await tokenStore.getSessionToken();
    expect(stored).toBe("fake-access-token");
  });

  it("reports authenticated after sign in", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    expect(await auth.isAuthenticated()).toBe(false);
    await auth.signIn("user@test.com", "pass");
    expect(await auth.isAuthenticated()).toBe(true);
  });

  it("signs out and clears tokens", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    await auth.signIn("user@test.com", "pass");
    await auth.signOut();

    expect(await auth.isAuthenticated()).toBe(false);
    expect(await tokenStore.getSessionToken()).toBeNull();
  });

  it("returns profile for authenticated user", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    await auth.signIn("user@test.com", "pass");
    const profile = await auth.getProfile();
    expect(profile).not.toBeNull();
    expect(profile?.id).toBe("fake-user-001");
    expect(profile?.email).toBe("dev@example.com");
  });

  it("returns null profile when not authenticated", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    const profile = await auth.getProfile();
    expect(profile).toBeNull();
  });

  it("sign up creates session", async () => {
    const tokenStore = createFakeTokenStore();
    const auth = createFakeAuthAdapter(tokenStore);

    const session = await auth.signUp("new@test.com", "pass");
    expect(session.accessToken).toBeTruthy();
    expect(await auth.isAuthenticated()).toBe(true);
  });
});
