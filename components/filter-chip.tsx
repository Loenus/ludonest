import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FilterChipProps {
  label: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export function FilterChip({ label, icon: Icon, active, onClick }: FilterChipProps) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className={[
        "h-10 sm:h-9 shrink-0 rounded-xl px-3.5 text-xs sm:text-[11px] font-medium transition-all duration-200",
        active
          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-400/30 hover:shadow-lg"
          : "border border-[#e7c998] bg-[#fffaf2] text-[#4a3020] shadow-[0_8px_18px_rgba(127,94,53,0.08)] hover:border-[#d9a95c] hover:text-[#2a1a12] hover:bg-[#fff0d6] dark:border-border/60 dark:bg-transparent dark:text-muted-foreground dark:shadow-none",
      ].join(" ")}
    >
      {Icon && <Icon size={12} className="-ml-0.5" />}
      {label}
    </Button>
  );
}
