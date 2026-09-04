"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";

import { cropToSquareWebp, MAX_IMAGE_INPUT_BYTES } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_BUCKET, avatarUrl } from "@/lib/storage";
import { GeneratedUserAvatar } from "@/lib/user-avatar";

/** Output edge in px. A profile photo never renders larger than ~112px. */
const OUT = 320;

interface AvatarUploadProps {
  /** Hidden field name submitted with the surrounding form. */
  name?: string;
  /** Seed (the user id) and label source for the generated fallback preview. */
  seed: string;
  fullName: string;
  /** Existing stored path when editing. */
  defaultPath?: string | null;
  size?: number;
}

export function AvatarUpload({
  name = "avatarPath",
  seed,
  fullName,
  defaultPath = null,
  size = 88,
}: AvatarUploadProps) {
  const supabase = useRef(createClient()).current;
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(defaultPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = path ? avatarUrl(path) : null;

  /** Remove a file this component uploaded (never the one already saved on the profile). */
  function dropScratch(p: string | null) {
    if (p && p !== defaultPath) {
      void supabase.storage.from(AVATAR_BUCKET).remove([p]).catch(() => {});
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError("Formato non supportato. Usa PNG, JPG o WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_INPUT_BYTES) {
      setError("Immagine troppo grande (max 8 MB).");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("no-session");

      const { blob, ext, type } = await cropToSquareWebp(file, OUT);
      const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(objectPath, blob, { contentType: type, upsert: false });
      if (upErr) throw upErr;

      dropScratch(path);
      setPath(objectPath);
    } catch {
      setError("Caricamento non riuscito. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    dropScratch(path);
    setPath(null);
    setError(null);
  }

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full rounded-full object-cover ring-2 ring-amber-400/30"
            style={{ width: size, height: size }}
          />
        ) : (
          <GeneratedUserAvatar
            seed={seed}
            name={fullName}
            size={size}
            className="rounded-full ring-2 ring-amber-400/30"
          />
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
            <Loader2 size={20} className="animate-spin text-foreground" />
          </span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={path ? "Cambia foto profilo" : "Carica foto profilo"}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-amber-400 text-slate-950 shadow-md transition-transform hover:scale-105 disabled:opacity-60"
        >
          <Camera size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {path && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
          >
            <X size={12} /> Rimuovi foto
          </button>
        )}
      </div>

      {error && <p className="text-[11px] font-medium text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onPick}
        className="hidden"
      />
      <input type="hidden" name={name} value={path ?? ""} />
    </div>
  );
}
