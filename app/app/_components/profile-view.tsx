import { ChevronRight, LogOut, UserCircle2 } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Card } from "@/components/ui/card";

interface ProfileViewProps {
  userName: string;
  bookedCount: number;
}

export function ProfileView({ userName, bookedCount }: ProfileViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Profilo
      </h1>
      <Card className="flex w-full items-center gap-3 border border-border/60 bg-card/80 p-4 backdrop-blur sm:gap-4 sm:p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
          <UserCircle2 size={28} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="ff-display truncate text-base font-semibold text-foreground">{userName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Giocatore · Milano</p>
        </div>
      </Card>
      <div className="grid w-full grid-cols-2 gap-3">
        <Card className="w-full border border-border/60 bg-card/80 p-4 backdrop-blur">
          <p className="font-mono text-xl font-bold text-amber-400 sm:text-2xl">{bookedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Prenotazioni</p>
        </Card>
        <Card className="w-full border border-border/60 bg-card/80 p-4 backdrop-blur">
          <p className="font-mono text-xl font-bold text-amber-400 sm:text-2xl">3</p>
          <p className="mt-1 text-xs text-muted-foreground">Preferiti</p>
        </Card>
      </div>
      <Card className="w-full overflow-hidden border border-border/60 bg-card/80 backdrop-blur">
        {["Notifiche", "Preferenze"].map((label, i) => (
          <button
            key={label}
            className="flex w-full items-center justify-between px-4 py-3 text-xs text-foreground transition-colors hover:bg-muted/40 sm:px-5 sm:py-3.5 sm:text-sm"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
          >
            {label}
            <ChevronRight size={15} className="text-muted-foreground" />
          </button>
        ))}
        <form action={signOut} style={{ borderTop: "1px solid var(--border)" }}>
          <button
            type="submit"
            className="flex w-full items-center justify-between px-4 py-3 text-xs text-foreground transition-colors hover:bg-muted/40 sm:px-5 sm:py-3.5 sm:text-sm"
          >
            Esci
            <LogOut size={15} className="text-muted-foreground" />
          </button>
        </form>
      </Card>
    </div>
  );
}
