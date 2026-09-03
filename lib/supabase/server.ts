import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Reads the anon key: every query is still subject to Row Level Security based
 * on the caller's session. Never use this for privileged writes — see
 * `lib/supabase/admin.ts`.
 */
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
            // `setAll` was called from a Server Component, which cannot write
            // cookies. A refreshed token is persisted on the next Server Action
            // or Route Handler (e.g. `/auth/callback`). Safe to ignore.
          }
        },
      },
    },
  );
}
