import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listPublicEvents } from "@/lib/events";
import { listVenues } from "@/lib/venues";

import { PlayerExperience } from "./player-experience";

export const metadata: Metadata = {
  title: "La tua area · LudoNest",
};

export default async function PlayerPage() {
  const session = await requireRole("player");
  const [venues, events] = await Promise.all([listVenues(), listPublicEvents()]);
  return <PlayerExperience userName={session.fullName} venues={venues} events={events} />;
}
