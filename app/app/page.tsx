import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";

import { PlayerExperience } from "./player-experience";

export const metadata: Metadata = {
  title: "La tua area · LudoNest",
};

export default async function PlayerPage() {
  const session = await requireRole("gamer");
  return <PlayerExperience userName={session.name} />;
}
