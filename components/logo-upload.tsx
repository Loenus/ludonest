"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { cropToSquareWebp, MAX_IMAGE_INPUT_BYTES } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { VENUE_LOGO_BUCKET, venueLogoUrl } from "@/lib/storage";
import { GeneratedVenueAvatar } from "@/lib/venue-avatar";

/** Output edge in px. 400 keeps a logo at ~10-25 KB as webp. */
const OUT = 400;

interface LogoUploadProps {
  /** Hidden field name submitted with the surrounding form. */
  name?: string;
  /** Seed for the generated fallback preview (venue id, or any stable string). */
  seed: string;
  /** Existing stored path when editing. */
  defaultPath?: string | null;
  label?: string;
}

export function LogoUpload({
  name = "logoPath",
  seed,
  defaultPath = null,
  label = "Logo del locale",
}: LogoUploadProps) {
  const supabase = useRef(createClient()).current;
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(defaultPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = path ? venueLogoUrl(path) : null;

  /** Remove a file this component uploaded (never the one already saved on the venue). */
  function dropScratch(p: string | null) {
    if (p && p !== defaultPath) {
      void supabase.storage.from(VENUE_LOGO_BUCKET).remove([p]).catch(() => {});
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
        .from(VENUE_LOGO_BUCKET)
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
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>

      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <GeneratedVenueAvatar seed={seed} size={64} className="rounded-full" />
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60">
              <Loader2 size={18} className="animate-spin text-foreground" />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border/70 px-3 text-xs font-medium transition-colors hover:bg-muted/60 disabled:opacity-60"
            >
              <ImagePlus size={14} /> {path ? "Cambia" : "Carica"}
            </button>
            {path && (
              <button
                type="button"
                onClick={remove}
                disabled={busy}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
              >
                <X size={14} /> Rimuovi
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            PNG, JPG o WebP · ritagliato quadrato e ridotto a 400px.
          </p>
        </div>
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
