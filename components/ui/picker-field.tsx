"use client";

import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * A native date / time input dressed up to match the other fields: a leading
 * icon, full-width (never overflows its container on mobile), and the whole
 * control is the tap target — the transparent webkit picker indicator is
 * stretched to cover it, and `showPicker()` handles the browsers that need a
 * nudge.
 */
export function PickerField({
  icon: Icon,
  className = "",
  onClick,
  ...props
}: ComponentProps<"input"> & { icon: LucideIcon }) {
  return (
    <div className="relative w-full min-w-0">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        {...props}
        onClick={(e) => {
          try {
            (
              e.currentTarget as HTMLInputElement & { showPicker?: () => void }
            ).showPicker?.();
          } catch {
            /* not user-activated / unsupported — the native tap still opens it */
          }
          onClick?.(e);
        }}
        className={
          "h-11 w-full min-w-0 appearance-none rounded-xl border border-input bg-input/30 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:text-left " +
          className
        }
      />
    </div>
  );
}
