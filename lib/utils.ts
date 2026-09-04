import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * True for a same-site relative path ("/dashboard?tab=eventi") — false for
 * anything that could redirect off-site ("//evil.com", "https://…", an empty
 * string). Use before trusting a `?from=`-style redirect target from the URL.
 */
export function isSafeRelativePath(value: string | undefined | null): value is string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
}
