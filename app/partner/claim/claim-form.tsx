"use client";

import { useActionState, useId, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { submitClaim, type ClaimState } from "@/app/actions/claims";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { HoursEditor } from "@/components/hours-editor";
import { LogoUpload } from "@/components/logo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseHours, WEEKDAYS } from "@/lib/hours";

type FieldKey = "name" | "address" | "hours";
type InvalidMap = Partial<Record<FieldKey, boolean>>;

export function ClaimForm() {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(submitClaim, {});
  const [invalid, setInvalid] = useState<InvalidMap>({});
  const anyInvalid = Boolean(invalid.name || invalid.address || invalid.hours);

  // Stable seed for the generated logo preview (the real default is later
  // seeded from the venue id).
  const logoSeed = useId();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const week = parseHours(fd.get("hours"));
    const next: InvalidMap = {
      name: !fd.get("name")?.toString().trim(),
      address:
        !fd.get("lat")?.toString().trim() || !fd.get("lng")?.toString().trim(),
      hours: !week || WEEKDAYS.every((d) => week[d].closed),
    };
    if (next.name || next.address || next.hours) {
      e.preventDefault();
      setInvalid(next);
    }
  }

  const clear = (f: FieldKey) =>
    setInvalid((prev) => (prev[f] ? { ...prev, [f]: false } : prev));

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[0_20px_50px_rgba(120,84,31,0.12)] backdrop-blur dark:shadow-none"
    >
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Nome del locale</span>
        <Input
          name="name"
          placeholder="Il Dado Nero"
          aria-invalid={invalid.name || undefined}
          onChange={() => clear("name")}
          className="h-11 rounded-xl aria-invalid:ring-destructive/40"
        />
      </label>

      <LogoUpload seed={logoSeed} />

      <AddressAutocomplete
        required
        invalid={invalid.address}
        onEdit={() => clear("address")}
      />

      <HoursEditor invalid={invalid.hours} onChange={() => clear("hours")} />

      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          Descrizione
          <span className="rounded-full border border-border/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Facoltativo
          </span>
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Raccontaci del locale: spazi, tipo di giochi, atmosfera…"
          className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm"
        />
      </label>

      {(state.error || anyInvalid) && (
        <p className="text-xs font-medium text-destructive">
          {state.error ?? "Compila i campi obbligatori evidenziati in rosso."}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl disabled:opacity-70"
      >
        {pending ? "Invio…" : "Invia richiesta"}
        {!pending && <CheckCircle2 size={16} />}
      </Button>
    </form>
  );
}
