import {
  CalendarDays, ClipboardList, LayoutDashboard, Search, Store, UserCircle2, Users,
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
