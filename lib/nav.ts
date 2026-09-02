import {
  Building2, CalendarDays, ClipboardList, LayoutDashboard, Search, ShieldCheck,
  Store, UserCircle2, Users,
} from "lucide-react";

import type { NavItem } from "@/lib/types";

export const PLAYER_NAV: NavItem[] = [
  { id: "cerca", label: "Cerca", icon: Search },
  { id: "eventi", label: "Eventi", icon: CalendarDays },
  { id: "community", label: "Community", icon: Users },
  { id: "profilo", label: "Profilo", icon: UserCircle2 },
];

export const MANAGER_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "locale", label: "Il tuo locale", icon: Store },
  { id: "eventi", label: "Eventi", icon: CalendarDays },
  { id: "prenotazioni", label: "Prenotazioni", icon: ClipboardList },
];

export const ADMIN_NAV: NavItem[] = [
  { id: "richieste", label: "Richieste locali", icon: ShieldCheck },
  { id: "locali", label: "Locali", icon: Building2 },
  { id: "utenti", label: "Utenti", icon: Users },
];
