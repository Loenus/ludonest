import { Dices } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Slightly larger lockup for hero / auth screens. */
  size?: "sm" | "md";
}

export function BrandLogo({ className, size = "sm" }: BrandLogoProps) {
  const md = size === "md";
  return (
    <div className={cn("flex items-center", md ? "gap-3" : "gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 shadow-lg shadow-amber-400/30 ring-1 ring-white/40",
          md ? "h-11 w-11" : "h-9 w-9",
        )}
      >
        <Dices size={md ? 23 : 19} className="text-slate-950" />
      </div>
      <span
        className={cn(
          "ff-display font-bold tracking-tight text-foreground",
          md ? "text-xl" : "text-lg",
        )}
      >
        Ludo
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Nest
        </span>
      </span>
    </div>
  );
}
