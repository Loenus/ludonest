import { Sparkles } from "lucide-react";

/** Flags a tab as a non-interactive mockup — sample content, no wired-up actions yet. */
export function MockupNotice({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-dashed border-amber-400/40 bg-amber-400/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
      <Sparkles size={13} className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400" />
      {children}
    </p>
  );
}
