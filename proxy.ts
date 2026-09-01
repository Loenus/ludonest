import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { HOME_PATH, LOGIN_PATH, SESSION_COOKIE, decodeSession } from "@/lib/session";

/**
 * Route protection for the two authenticated areas.
 *
 *  - `/app/*`       is the "gamer" area   -> requires a `gamer` session
 *  - `/dashboard/*` is the "manager" area -> requires a `manager` session
 *
 * A gamer can never reach the manager area and vice versa: mismatched roles are
 * bounced to their own home. Visiting a login page while already authenticated
 * also redirects home, so there is no way to "switch role" from the UI.
 */

const GAMER_AREA = "/app";
const MANAGER_AREA = "/dashboard";
const LOGIN_PAGES = new Set(Object.values(LOGIN_PATH));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value);

  const isGamerArea =
    pathname === GAMER_AREA || pathname.startsWith(`${GAMER_AREA}/`);
  const isManagerArea =
    pathname === MANAGER_AREA || pathname.startsWith(`${MANAGER_AREA}/`);

  if (isGamerArea || isManagerArea) {
    const requiredRole = isGamerArea ? "gamer" : "manager";

    if (!session) {
      return NextResponse.redirect(
        new URL(LOGIN_PATH[requiredRole], request.url),
      );
    }
    if (session.role !== requiredRole) {
      return NextResponse.redirect(
        new URL(HOME_PATH[session.role], request.url),
      );
    }
  }

  if (session && LOGIN_PAGES.has(pathname)) {
    return NextResponse.redirect(new URL(HOME_PATH[session.role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/login", "/partner/login"],
};
