import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session on every request and keeps the auth
 * cookies in sync between the request and the response. Called from `proxy.ts`.
 *
 * Returns both the (possibly cookie-mutated) response and the resolved user so
 * the proxy can run optimistic route guards without a second round-trip.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT: `getUser()` (not `getSession()`) — it revalidates the token with
  // the Supabase Auth server. Do not run any code between creating the client
  // and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
