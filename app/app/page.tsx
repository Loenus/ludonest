import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { getPlayerBookingsFromToday } from "@/lib/bookings";
import { listPublicEvents } from "@/lib/events";
import { listVenues } from "@/lib/venues";

import { PlayerExperience } from "./player-experience";

export const metadata: Metadata = {
  title: "La tua area · LudoNest",
};

export default async function PlayerPage() {
  const session = await requireRole("player");
  const [venues, events, upcomingBookings] = await Promise.all([
    listVenues(),
    listPublicEvents(),
    getPlayerBookingsFromToday(session.userId),
  ]);
  return (
    <PlayerExperience
      userId={session.userId}
      userName={session.fullName}
      email={session.email}
      avatarPath={session.avatarPath}
      venues={venues}
      events={events}
      upcomingBookings={upcomingBookings}
    />
  );
}
