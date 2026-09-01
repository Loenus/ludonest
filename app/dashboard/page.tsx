import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";

import { ManagerExperience } from "./manager-experience";

export const metadata: Metadata = {
  title: "Dashboard gestore · LudoNest",
};

export default async function DashboardPage() {
  const session = await requireRole("manager");
  return <ManagerExperience userName={session.name} />;
}
