/**
 * Identity port: Supabase Auth adapter using @supabase/ssr for server-side sessions.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AuthenticationError, sanitizeProviderError } from "./errors";

export interface AuthUser {
  id: string;
  email: string | undefined;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface IdentityPort {
  getSession(): Promise<AuthSession | null>;
  getUser(): Promise<AuthUser | null>;
  requireAuth(): Promise<AuthSession>;
}

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        try {
          const cookieStore = await cookies();
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Cookies can only be modified in a Server Action or Route Handler.
          // Silently ignore in Server Components.
        }
      },
    },
  });
}

export class SupabaseAuthAdapter implements IdentityPort {
  async getSession(): Promise<AuthSession | null> {
    try {
      const supabase = createSupabaseServerClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) return null;

      return {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        accessToken: session.access_token,
      };
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to retrieve session");
    }
  }

  async getUser(): Promise<AuthUser | null> {
    try {
      const supabase = createSupabaseServerClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return null;

      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      throw sanitizeProviderError(error, "Failed to retrieve user");
    }
  }

  async requireAuth(): Promise<AuthSession> {
    const session = await this.getSession();
    if (!session) {
      throw new AuthenticationError();
    }
    return session;
  }
}
