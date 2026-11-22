"use client";

import { useRef, useState } from "react";
import { previewUrl, uploadImage } from "@/lib/adminApi";

// Éléments communs des éditeurs du back-office (projets, localités).

export const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-[#F7C66A]";
export const labelCls = "mb-1.5 block text-sm font-medium text-white/80";
export const card = "rounded-xl border border-white/10 bg-white/[0.03] p-5";
export const hint = "mt-1.5 text-xs text-white/45";

export const TEXT_LOCALES = ["fr", "en", "ar"] as const;
export type TextLocale = (typeof TEXT_LOCALES)[number];
export const LOCALE_NAMES: Record<TextLocale, string> = { fr: "Français", en: "Anglais", ar: "Arabe" };

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** Une image (vignette, couverture, pictogramme…) : aperçu, envoi, retrait. */
export function ImageField({
  label,
  value,
  onChange,
  folder,
  aspect = "aspect-[16/9]",
  contain = false,
  help,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: "projects" | "localities";
  aspect?: string;
  contain?: boolean;
  help?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      onChange(await uploadImage(file, folder));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className={labelCls}>{label}</span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className={`group relative block w-full overflow-hidden rounded-lg border border-dashed border-white/25 bg-white/5 ${aspect}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl(value)} alt="" className={`h-full w-full ${contain ? "object-contain p-2" : "object-cover"}`} />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-white/50">{busy ? "Envoi…" : "Choisir une image"}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm opacity-0 transition group-hover:opacity-100">
          {busy ? "Envoi…" : "Changer"}
        </span>
      </button>
      {help && <p className={hint}>{help}</p>}
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
      {value && (
        <button type="button" onClick={() => onChange("")} className="mt-1.5 text-xs text-white/50 underline hover:text-white">
          Retirer l&apos;image
        </button>
      )}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Galerie : envoi multiple, réordonnancement, retrait. */
export function GalleryField({ value, onChange, folder }: { value: string[]; onChange: (urls: string[]) => void; folder: "projects" }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    setBusy(list.length);
    const added: string[] = [];
    for (const f of list) {
      try {
        added.push(await uploadImage(f, folder));
      } catch (e) {
        setError((e as Error).message);
      }
      setBusy((n) => n - 1);
    }
    onChange([...value, ...added]);
  };

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((url, i) => (
          <li key={`${url}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl(url)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <span className="absolute start-1.5 top-1.5 rounded bg-black/70 px-1.5 text-xs">{i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 p-1 text-sm opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Avancer la photo" className="rounded px-2 hover:bg-white/20 disabled:opacity-30">
                ←
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} aria-label="Retirer la photo" className="rounded px-2 text-red-300 hover:bg-red-500/30">
                ✕
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Reculer la photo" className="rounded px-2 hover:bg-white/20 disabled:opacity-30">
                →
              </button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy > 0}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-white/25 bg-white/5 text-sm text-white/60 hover:border-[#F7C66A] hover:text-[#F7C66A]"
          >
            <span className="text-2xl" aria-hidden>
              +
            </span>
            {busy > 0 ? `Envoi… (${busy})` : "Ajouter des photos"}
          </button>
        </li>
      </ul>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          void add(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/** Interrupteur oui / non. */
export function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-white/85">{label}</span>
        {help && <span className="block text-xs text-white/45">{help}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full bg-white/20 transition after:absolute after:start-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-emerald-500 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-[#F7C66A]"
      />
    </label>
  );
}

/** Onglets FR / EN / AR avec pastille d'état (vide, traduction auto à relire, prêt). */
export function LocaleTabs({
  tab,
  onTab,
  state,
  onTranslate,
  translating,
}: {
  tab: TextLocale;
  onTab: (l: TextLocale) => void;
  state: Record<TextLocale, "empty" | "machine" | "ready">;
  onTranslate: (l: TextLocale) => void;
  translating: TextLocale | null;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Langue">
      {TEXT_LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={tab === l}
          onClick={() => onTab(l)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
            tab === l ? "border-[#F7C66A] bg-[#F7C66A]/15 text-[#F7C66A]" : "border-white/15 text-white/70 hover:bg-white/5"
          }`}
        >
          {LOCALE_NAMES[l]}
          <span
            className={`h-2 w-2 rounded-full ${state[l] === "empty" ? "bg-white/25" : state[l] === "machine" ? "bg-amber-400" : "bg-emerald-400"}`}
            aria-label={state[l] === "empty" ? "vide" : state[l] === "machine" ? "à relire" : "prêt"}
          />
        </button>
      ))}
      {tab !== "fr" && (
        <button
          type="button"
          onClick={() => onTranslate(tab)}
          disabled={translating !== null}
          className="ms-auto rounded-lg border border-[#F7C66A]/60 px-4 py-2 text-sm font-medium text-[#F7C66A] transition hover:bg-[#F7C66A]/10 disabled:opacity-50"
        >
          {translating === tab ? "Traduction en cours…" : "Traduire depuis le français"}
        </button>
      )}
    </div>
  );
}

/** Barre fixe en bas : état + bouton Enregistrer. */
export function SaveBar({
  message,
  dirty,
  saving,
  onSave,
  saveLabel = "Enregistrer",
}: {
  message: { ok: boolean; text: string } | null;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#031B17]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <p role="status" className={`min-w-0 flex-1 truncate text-sm ${message ? (message.ok ? "text-emerald-300" : "text-red-300") : dirty ? "text-amber-200" : "text-white/50"}`}>
          {message?.text || (dirty ? "Modifications non enregistrées" : "Tout est enregistré")}
        </p>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-[#F7C66A] px-6 py-2 text-sm font-semibold text-[#031B17] hover:bg-white disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
