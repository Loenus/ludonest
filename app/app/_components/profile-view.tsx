import { ChevronRight, LogOut } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import type { PlayerBooking } from "@/lib/types";

import { ProfileBookings } from "./profile-bookings";
import { ProfileHeader } from "./profile-header";

interface ProfileViewProps {
  userId: string;
  fullName: string;
  email: string;
  avatarPath: string | null;
  upcomingBookings: PlayerBooking[];
}

export function ProfileView({
  userId,
  fullName,
  email,
  avatarPath,
  upcomingBookings,
}: ProfileViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 sm:gap-8">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Profilo
      </h1>

      <ProfileHeader
        userId={userId}
        fullName={fullName}
        email={email}
        avatarPath={avatarPath}
      />

      <ProfileBookings upcoming={upcomingBookings} />

      <form action={signOut}>
        <button
          type="submit"
          className="group flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-3.5 text-left backdrop-blur transition-all hover:border-rose-400/40 hover:bg-rose-500/5"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-colors group-hover:bg-rose-500/15">
              <LogOut size={16} />
            </span>
            <span className="text-sm font-medium text-foreground">Esci dall&apos;account</span>
          </span>
          <ChevronRight
            size={16}
            className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </form>
    </div>
  );
}
