import { MessageCircleQuestion, Sparkles, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { MockupNotice } from "@/components/mockup-notice";

/** Placeholder — a rules-explainer assistant is not built yet. */
export function ChatView() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-6">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Chat
      </h1>

      <MockupNotice>
        Anteprima non interagibile: questa sezione non è ancora funzionante.
      </MockupNotice>

      <Card className="flex flex-col items-center gap-4 border border-dashed border-border/60 bg-card/60 px-6 py-14 text-center backdrop-blur">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 ring-1 ring-amber-400/30">
          <MessageCircleQuestion size={24} className="text-amber-500 dark:text-amber-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="mx-auto inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <Sparkles size={11} /> In arrivo
          </span>
          <p className="ff-display text-lg font-semibold text-foreground">
            Un aiuto per le regole, non (solo) una chat
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {"L'idea principale è poter chiedere spiegazioni sulle regole di un gioco al tavolo — es. \"come funziona questa carta?\" — invece di doverle cercare sul manuale."}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <Users size={13} className="shrink-0" />
          In più, messaggi diretti con altri giocatori e locali.
        </div>
      </Card>
    </div>
  );
}
