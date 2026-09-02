import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { listVenues } from "@/lib/venues";

import { PlayerExperience } from "./player-experience";

export const metadata: Metadata = {
  title: "La tua area · LudoNest",
};

export default async function PlayerPage() {
  const session = await requireRole("player");
  const venues = await listVenues();
  return <PlayerExperience userName={session.fullName} venues={venues} />;
}
