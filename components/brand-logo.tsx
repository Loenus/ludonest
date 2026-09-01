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
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-400/30",
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
        TAVOLO
      </span>
    </div>
  );
}
