import { Dice6 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function RatingBadge({ rating }: { rating: number }) {
  return (
    <Badge
      variant="secondary"
      className="rating-badge h-7 gap-1.5 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-amber-100/80 to-orange-50 px-2.5 text-[10px] shadow-[0_8px_18px_rgba(217,119,6,0.12)] dark:border-amber-400/40 dark:bg-gradient-to-r dark:from-amber-400/15 dark:to-amber-500/10 dark:shadow-none"
    >
      <Dice6 size={12} className="text-amber-500 dark:text-amber-400" />
      <span className="font-mono font-bold text-[11px] text-amber-700 dark:text-amber-300">
        {rating.toFixed(1)}
      </span>
      <span className="font-mono text-[9px] text-amber-600/80 dark:text-muted-foreground">/6</span>
    </Badge>
  );
}
