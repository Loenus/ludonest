import type { BookingStatus } from "@/lib/types";

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "in attesa",
  accepted: "confermata",
  declined: "rifiutata",
  cancelled: "annullata",
};

/** Badge tone classes per status — amber/emerald/rose/muted. */
export const BOOKING_STATUS_TONE: Record<BookingStatus, string> = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-700 dark:text-amber-300",
  accepted:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  declined: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  cancelled: "border-border/60 bg-muted text-muted-foreground",
};
