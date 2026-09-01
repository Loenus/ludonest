import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Accedi come giocatore · LudoNest",
};

export default function GamerLoginPage() {
  return <AuthForm variant="gamer" />;
}
