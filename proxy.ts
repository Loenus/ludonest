import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import { LOGIN_PATH } from "@/lib/session";

/**
 * Refreshes the Supabase session cookie on every matched request and runs an
 * **optimistic** auth-presence guard (no DB / role lookup here — this runs on
 * prefetches too). Role enforcement and "already signed in" redirects live in
 * the DAL (`lib/auth.ts`), close to the data.
 */

const AREAS = ["/app", "/dashboard", "/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const inArea = AREAS.some((a) => pathname === a || pathname.startsWith(`${a}/`));
  const needsAuth = inArea || pathname === "/partner/claim";

  if (needsAuth && !user) {
    const loginPath = pathname.startsWith("/dashboard") ? LOGIN_PATH.manager : LOGIN_PATH.player;
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/app/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/partner/login",
    "/partner/claim",
    "/login",
  ],
};
