import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import { HOME_PATH } from "@/lib/session";
import type { AppRole } from "@/lib/types";

/**
 * Auth landing for both flows:
 *  - OAuth / PKCE       -> `?code=...`            -> exchangeCodeForSession
 *  - Email confirm/OTP  -> `?token_hash=&type=`  -> verifyOtp
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const nextParam = searchParams.get("next") ?? "";
  const safeNext =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

  const supabase = await createClient();

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  if (!ok) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (safeNext) {
    return NextResponse.redirect(`${origin}${safeNext}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  return NextResponse.redirect(
    `${origin}${HOME_PATH[(profile?.role as AppRole) ?? "player"]}`,
  );
}
