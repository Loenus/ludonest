"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Pencil, ShieldCheck } from "lucide-react";

import { updateProfile, type ProfileFormState } from "@/app/actions/profile";
import { AvatarUpload } from "@/components/avatar-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/lib/user-avatar";

/** "Mario Rossi" -> { first: "Mario", last: "Rossi" }. Best-effort split for editing. */
function splitName(fullName: string): { first: string; last: string } {
  const trimmed = fullName.trim();
  const i = trimmed.indexOf(" ");
  return i === -1
    ? { first: trimmed, last: "" }
    : { first: trimmed.slice(0, i), last: trimmed.slice(i + 1).trim() };
}

export function ProfileHeader({
  userId,
  fullName,
  email,
  avatarPath,
}: {
  userId: string;
  fullName: string;
  email: string;
  avatarPath: string | null;
}) {
  const [state, formAction, pending] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {},
  );
  const [editing, setEditing] = useState(false);
  const [handledOk, setHandledOk] = useState<ProfileFormState | null>(null);

  // A successful save returns a fresh `{ ok: true }` object; leave edit mode
  // once for it (revalidatePath refreshes the props underneath).
  if (editing && state.ok && state !== handledOk) {
    setHandledOk(state);
    setEditing(false);
  }

  const { first, last } = splitName(fullName);
  const savedOk = !editing && state.ok === true;

  const body = (
    <Card
      size="sm"
      className="w-full border border-border/60 bg-gradient-to-br from-card to-card/60 p-5 shadow-[0_18px_40px_rgba(120,84,31,0.08)] backdrop-blur sm:p-6 dark:shadow-none"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400/90">
            {editing ? "Modifica in corso…" : "Il tuo profilo"}
          </p>
          {savedOk && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={12} /> Modifiche salvate
            </span>
          )}
        </div>

        {editing ? (
          <div className="flex shrink-0 gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-70"
            >
              {pending ? "Salvataggio…" : "Salva"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setEditing(false)}
              className="rounded-xl"
            >
              Annulla
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-xl bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30 hover:bg-amber-300"
          >
            <Pencil size={14} /> Modifica
          </Button>
        )}
      </div>

      <div
        className={
          editing
            ? "flex flex-col gap-5 sm:flex-row sm:items-start"
            : "flex items-center gap-4"
        }
      >
        {editing ? (
          <AvatarUpload seed={userId} fullName={fullName} defaultPath={avatarPath} />
        ) : (
          <UserAvatar
            user={{ id: userId, fullName, avatarPath }}
            size={72}
            className="ring-2 ring-amber-400/25"
          />
        )}

        {editing ? (
          <div className="flex w-full flex-col gap-3 sm:max-w-sm">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Nome</span>
                <Input
                  name="firstName"
                  required
                  minLength={1}
                  maxLength={60}
                  defaultValue={first}
                  className="h-10 rounded-xl"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Cognome</span>
                <Input
                  name="lastName"
                  required
                  minLength={1}
                  maxLength={60}
                  defaultValue={last}
                  className="h-10 rounded-xl"
                />
              </label>
            </div>
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-amber-500" />
              Nome e cognome sono obbligatori e devono essere quelli reali: sono i
              dati con cui un locale ti riconosce quando ti iscrivi a un evento.
            </p>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Email</span>
              <Input
                name="email"
                type="email"
                required
                defaultValue={email}
                className="h-10 rounded-xl"
              />
            </label>
          </div>
        ) : (
          <div className="min-w-0">
            <h1 className="ff-display truncate text-xl font-bold leading-tight text-foreground sm:text-2xl">
              {fullName}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">{email}</p>
          </div>
        )}
      </div>

      {state.error && (
        <p className="text-xs font-medium text-destructive">{state.error}</p>
      )}
      {state.notice && (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {state.notice}
        </p>
      )}
    </Card>
  );

  return editing ? <form action={formAction}>{body}</form> : body;
}
