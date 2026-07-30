/**
 * Server-side Supabase client with cookie-based sessions.
 * Uses @supabase/ssr createServerClient for Next.js App Router.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Cookies can only be modified in a Server Action or Route Handler.
            // Silently ignore when called from a Server Component.
          }
        },
      },
    }
  );
}
