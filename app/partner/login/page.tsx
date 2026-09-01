import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Accedi come gestore · TAVOLO",
};

export default function ManagerLoginPage() {
  return <AuthForm variant="manager" />;
}
