import type { AppRole } from "@/lib/types";

/** Where each role lands after authentication. */
export const HOME_PATH: Record<AppRole, string> = {
  player: "/app",
  manager: "/dashboard",
  superadmin: "/admin",
};

/** Player and manager sign-in entry points. Superadmins use the player page. */
export const LOGIN_PATH = {
  player: "/login",
  manager: "/partner/login",
} as const;

/** Path to the venue-claim form a would-be manager fills after registering. */
export const CLAIM_PATH = "/partner/claim";
