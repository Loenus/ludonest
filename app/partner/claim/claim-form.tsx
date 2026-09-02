"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";

import { submitClaim, type ClaimState } from "@/app/actions/claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClaimForm() {
  const [state, formAction, pending] = useActionState<ClaimState, FormData>(submitClaim, {});

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[0_20px_50px_rgba(120,84,31,0.12)] backdrop-blur dark:shadow-none"
    >
      <Field name="name" label="Nome del locale" placeholder="Il Dado Nero" required />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field name="city" label="Città" placeholder="Milano" required />
        <Field name="hours" label="Orari" placeholder="16:00 - 24:00" />
      </div>
      <Field name="address" label="Indirizzo" placeholder="Via dei Giochi 12" required />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Descrizione</span>
        <textarea
          name="description"
          rows={3}
          maxLength={1000}
          placeholder="Raccontaci del locale: spazi, tipo di giochi, atmosfera…"
          className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </label>

      {state.error && <p className="text-xs font-medium text-destructive">{state.error}</p>}

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

function Field({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input name={name} placeholder={placeholder} required={required} className="h-11 rounded-xl" />
    </label>
  );
}
