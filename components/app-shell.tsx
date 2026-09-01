"use client";

import { LogOut, UserCircle2 } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/types";

interface AppShellProps {
  navItems: NavItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  userName: string;
  roleLabel: string;
  children: React.ReactNode;
}

export function AppShell({
  navItems,
  activeTab,
  onTabChange,
  userName,
  roleLabel,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden border-r border-border/60 bg-card/80 backdrop-blur md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:p-6">
          <BrandLogo />

          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-muted/40 p-3 backdrop-blur">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserCircle2 size={22} className="text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
              <p className="text-[11px] font-medium text-amber-500 dark:text-amber-400">
                {roleLabel}
              </p>
            </div>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-300 ring-1 ring-amber-400/30 shadow-md"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>

          <form action={logout} className="mt-auto">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <LogOut size={18} /> Esci
            </button>
          </form>
        </aside>

        <div className="flex flex-1 flex-col md:ml-64">
          {/* Header mobile */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur md:hidden">
            <BrandLogo />
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-amber-500 dark:text-amber-400">
                {roleLabel}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  aria-label="Esci"
                  className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </header>

          <main className="w-full flex-1 px-4 sm:px-5 md:px-8 py-6 sm:py-8 pb-24 md:pb-10">
            {children}
          </main>
        </div>

        {/* Bottom nav mobile */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border/60 bg-card/90 backdrop-blur md:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 py-3 text-[10px] font-medium transition-colors",
                activeTab === item.id ? "text-amber-400" : "text-muted-foreground",
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
