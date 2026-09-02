import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — **bypasses Row Level Security**.
 *
 * Only for privileged server-side operations that legitimately act across
 * users, e.g. a superadmin approving a venue claim (which creates a venue owned
 * by a different account). Every caller MUST verify authorization in code
 * first (see `requireRole("superadmin")`).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
