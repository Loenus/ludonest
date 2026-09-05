"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { cropToRatioWebp, MAX_IMAGE_INPUT_BYTES } from "@/lib/image";
import { EVENT_COVER_BUCKET, eventCoverUrl } from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";

/** Banner width in px. ~1280 covers a full-bleed hero without bloating Storage. */
const OUT_WIDTH = 1280;
const ASPECT = 16 / 9;

interface CoverUploadProps {
  /** Hidden field name submitted with the surrounding form. */
  name?: string;
  /** Existing stored path when editing. */
  defaultPath?: string | null;
}

export function CoverUpload({ name = "coverPath", defaultPath = null }: CoverUploadProps) {
  const supabase = useRef(createClient()).current;
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(defaultPath);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = path ? eventCoverUrl(path) : null;

  function dropScratch(p: string | null) {
    if (p && p !== defaultPath) {
      void supabase.storage.from(EVENT_COVER_BUCKET).remove([p]).catch(() => {});
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

      const { blob, ext, type } = await cropToRatioWebp(file, OUT_WIDTH, ASPECT);
      const objectPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(EVENT_COVER_BUCKET)
        .upload(objectPath, blob, { contentType: type, upsert: false });
      if (upErr) throw upErr;

      dropScratch(path);
      setPath(objectPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      setError(
        msg.includes("bucket") && msg.includes("not found")
          ? "Spazio immagini eventi non ancora configurato. Applica le migrazioni del database."
          : "Caricamento non riuscito. Riprova.",
      );
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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="group relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-dashed border-border/70 bg-muted/40 transition-colors hover:border-amber-400/50 disabled:opacity-60"
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <ImagePlus size={22} />
            <span className="text-xs font-medium">Carica una copertina</span>
            <span className="text-[10px]">Consigliato 16:9 · JPG, PNG o WebP</span>
          </span>
        )}

        {previewUrl && (
          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-xs font-medium text-white opacity-0 transition-all group-hover:bg-slate-950/40 group-hover:opacity-100">
            Cambia copertina
          </span>
        )}

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 size={20} className="animate-spin text-foreground" />
          </span>
        )}
      </button>

      {path && (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
        >
          <X size={12} /> Rimuovi copertina
        </button>
      )}

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
