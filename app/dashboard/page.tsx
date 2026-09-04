import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getManagedVenue, requireRole } from "@/lib/auth";
import { getVenueBookingsFromToday } from "@/lib/bookings";
import { listVenueEvents } from "@/lib/events";
import { CLAIM_PATH } from "@/lib/session";
import { mapVenue } from "@/lib/venues";

import { ManagerExperience } from "./manager-experience";

export const metadata: Metadata = {
  title: "Dashboard gestore · LudoNest",
};

export default async function DashboardPage() {
  const session = await requireRole("manager");

  const venueRow = await getManagedVenue();
  if (!venueRow) redirect(CLAIM_PATH);
  const venue = mapVenue(venueRow);

  const [bookings, events] = await Promise.all([
    getVenueBookingsFromToday(venue.id),
    listVenueEvents(venue.id),
  ]);

  return (
    <ManagerExperience
      userName={session.fullName}
      venue={venue}
      bookings={bookings}
      events={events}
    />
  );
}
