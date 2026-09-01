export const MONTHS = [
  "GEN", "FEB", "MAR", "APR", "MAG", "GIU",
  "LUG", "AGO", "SET", "OTT", "NOV", "DIC",
] as const;

export interface EventDateParts {
  day: string;
  month: string;
}

/** "2026-08-28" -> { day: "28", month: "AGO" } */
export function formatEventDate(dateStr: string): EventDateParts {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
  };
}
