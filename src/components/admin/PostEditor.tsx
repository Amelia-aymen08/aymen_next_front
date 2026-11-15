"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import RichEditor from "./RichEditor";
import { CATEGORY_LABELS, LOCALES, LOCALE_NAMES, isComplete, type AdminLocale } from "./blogLabels";
import { adminFetch, backendUrl, uploadImage, type AdminPost, type TranslationFields } from "@/lib/adminApi";

const EMPTY: TranslationFields = { title: "", excerpt: "", contentHtml: "", metaTitle: "", metaDescription: "", machineTranslated: false };

type Meta = {
  slug: string;
  category: string;
  status: "draft" | "published";
  publishedAt: string; // yyyy-mm-dd
  coverImage: string;
  author: string;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 150);
}

const field = "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-white outline-none placeholder:text-white/30 focus:border-[#F7C66A]";
const label = "mb-1.5 block text-sm font-medium text-white/80";

export default function PostEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const isNew = id === null;
  const [loaded, setLoaded] = useState(isNew);
  const [meta, setMeta] = useState<Meta>({ slug: "", category: "style-de-vie", status: "draft", publishedAt: todayIso(), coverImage: "", author: "Aymen Promotion" });
  const [tr, setTr] = useState<Record<AdminLocale, TranslationFields>>({ fr: { ...EMPTY }, en: { ...EMPTY }, ar: { ...EMPTY } });
  const [tab, setTab] = useState<AdminLocale>("fr");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<AdminLocale | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [legacy, setLegacy] = useState<string | null>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNew) return;
    adminFetch<AdminPost>(`/blog/${id}`)
      .then((p) => {
        setMeta({
          slug: p.slug,
          category: p.category,
          status: p.status,
          publishedAt: (p.publishedAt || "").slice(0, 10) || todayIso(),
          coverImage: p.coverImage || "",
          author: p.author || "",
        });
        setTr({
          fr: { ...EMPTY, ...p.translations.fr },
          en: { ...EMPTY, ...p.translations.en },
          ar: { ...EMPTY, ...p.translations.ar },
        });
        setLegacy(p.legacySource);
        setLoaded(true);
      })
      .catch((e) => setMessage({ ok: false, text: (e as Error).message }));
  }, [id, isNew]);

  // Alerte avant de quitter avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const updateMeta = (patch: Partial<Meta>) => {
    setMeta((m) => ({ ...m, ...patch }));
    setDirty(true);
  };

  const updateTr = (locale: AdminLocale, patch: Partial<TranslationFields>) => {
    setTr((all) => ({ ...all, [locale]: { ...all[locale], ...patch } }));
    setDirty(true);
    if (locale === "fr" && patch.title !== undefined && !slugTouched) {
      setMeta((m) => ({ ...m, slug: slugify(patch.title || "") }));
    }
  };

  const translateFrom = async (to: AdminLocale) => {
    const fr = tr.fr;
    if (!isComplete(fr)) {
      setMessage({ ok: false, text: "Rédigez d'abord le titre et le contenu en français." });
      return;
    }
    const filled = isComplete(tr[to]);
    if (filled && !window.confirm(`La version ${LOCALE_NAMES[to].toLowerCase()} existe déjà. La remplacer par une nouvelle traduction automatique ?`)) return;
    setTranslating(to);
    setMessage(null);
    try {
      const { fields, provider } = await adminFetch<{ provider: string; fields: Partial<TranslationFields> }>("/translate", {
        method: "POST",
        body: JSON.stringify({ from: "fr", to, fields: { title: fr.title, excerpt: fr.excerpt, contentHtml: fr.contentHtml, metaTitle: fr.metaTitle, metaDescription: fr.metaDescription } }),
      });
      updateTr(to, { ...EMPTY, ...fields, machineTranslated: true });
      setTab(to);
      setMessage({ ok: true, text: `Traduction automatique (${provider}) insérée. Relisez-la avant de publier.` });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setTranslating(null);
    }
  };

  const onCover = async (file?: File) => {
    if (!file) return;
    try {
      updateMeta({ coverImage: await uploadImage(file) });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  const save = async (nextStatus?: Meta["status"]) => {
    setSaving(true);
    setMessage(null);
    const status = nextStatus ?? meta.status;
    const body = {
      ...meta,
      status,
      slug: meta.slug || slugify(tr.fr.title),
      publishedAt: meta.publishedAt ? new Date(`${meta.publishedAt}T09:00:00`).toISOString() : null,
      coverImage: meta.coverImage || null,
      translations: tr,
    };
    try {
      const saved = await adminFetch<AdminPost>(isNew ? "/blog" : `/blog/${id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      setDirty(false);
      setMeta((m) => ({ ...m, status: saved.status, slug: saved.slug }));
      setMessage({ ok: true, text: status === "published" ? "Article publié. Le site est mis à jour." : "Brouillon enregistré." });
      if (isNew) router.replace(`/admin/blog/${saved.id}`);
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Supprimer définitivement cet article, dans toutes les langues ?")) return;
    try {
      await adminFetch(`/blog/${id}`, { method: "DELETE" });
      setDirty(false);
      router.replace("/admin/blog");
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  const current = tr[tab];
  const dir = tab === "ar" ? "rtl" : "ltr";
  const seoTitle = current.metaTitle || current.title;
  const seoDesc = current.metaDescription || current.excerpt;
  const publicPath = useMemo(() => (l: AdminLocale) => `${l === "fr" ? "" : `/${l}`}/blog/${meta.slug}`, [meta.slug]);

  if (!loaded) {
    return message ? <p className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{message.text}</p> : <p className="py-10 text-center text-white/50">Chargement…</p>;
  }

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/blog" className="text-sm text-white/50 hover:text-white">
            ← Tous les articles
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{isNew ? "Nouvel article" : tr.fr.title || "Article"}</h1>
        </div>
        {!isNew && meta.status === "published" && (
          <div className="flex gap-2 text-sm">
            {LOCALES.filter((l) => isComplete(tr[l])).map((l) => (
              <a key={l} href={publicPath(l)} target="_blank" rel="noopener" className="rounded-md border border-white/15 px-3 py-1.5 text-white/70 hover:bg-white/10">
                Voir {l.toUpperCase()} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {legacy === "strapi-archive" && (
        <p className="mb-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          Article récupéré de l&apos;ancien blog : ses images ont été perdues. Ajoutez une image de couverture (et des images dans le texte si besoin).
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* ---------- Colonne principale : textes par langue ---------- */}
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2" role="tablist" aria-label="Langue">
            {LOCALES.map((l) => {
              const done = isComplete(tr[l]);
              return (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={tab === l}
                  onClick={() => setTab(l)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                    tab === l ? "border-[#F7C66A] bg-[#F7C66A]/15 text-[#F7C66A]" : "border-white/15 text-white/70 hover:bg-white/5"
                  }`}
                >
                  {LOCALE_NAMES[l]}
                  <span
                    className={`h-2 w-2 rounded-full ${!done ? "bg-white/25" : tr[l].machineTranslated ? "bg-amber-400" : "bg-emerald-400"}`}
                    aria-label={!done ? "vide" : tr[l].machineTranslated ? "à relire" : "prêt"}
                  />
                </button>
              );
            })}
            {tab !== "fr" && (
              <button
                type="button"
                onClick={() => translateFrom(tab)}
                disabled={translating !== null}
                className="ms-auto rounded-lg border border-[#F7C66A]/60 px-4 py-2 text-sm font-medium text-[#F7C66A] transition hover:bg-[#F7C66A]/10 disabled:opacity-50"
              >
                {translating === tab ? "Traduction en cours…" : "Traduire depuis le français"}
              </button>
            )}
          </div>

          {tab !== "fr" && current.machineTranslated && (
            <label className="mb-4 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <input type="checkbox" className="mt-0.5 accent-[#F7C66A]" checked={false} onChange={() => updateTr(tab, { machineTranslated: false })} />
              <span>
                Traduction automatique : relisez et corrigez le texte (noms des résidences, ton, termes immobiliers), puis cochez cette case
                pour la marquer comme relue.
              </span>
            </label>
          )}

          <div className="space-y-5" dir={dir}>
            <div>
              <label className={label} htmlFor="title">
                Titre {tab === "fr" && <span className="text-[#F7C66A]">*</span>}
              </label>
              <input id="title" className={`${field} text-lg font-semibold`} value={current.title} onChange={(e) => updateTr(tab, { title: e.target.value })} />
            </div>
            <div>
              <label className={label} htmlFor="excerpt">
                Résumé <span className="text-white/40">(affiché sur la carte de l&apos;article)</span>
              </label>
              <textarea id="excerpt" rows={3} className={field} value={current.excerpt} onChange={(e) => updateTr(tab, { excerpt: e.target.value })} />
            </div>
            <div>
              <span className={label}>Contenu {tab === "fr" && <span className="text-[#F7C66A]">*</span>}</span>
              <RichEditor key={tab} value={current.contentHtml} onChange={(html) => updateTr(tab, { contentHtml: html })} dir={dir} />
            </div>

            <details className="rounded-xl border border-white/10 bg-white/[0.03] p-4" dir="ltr">
              <summary className="cursor-pointer text-sm font-medium text-white/80">Référencement Google (optionnel)</summary>
              <div className="mt-4 space-y-4" dir={dir}>
                <div>
                  <label className={label} htmlFor="metaTitle">
                    Titre Google <span className="text-white/40">({(current.metaTitle || "").length}/60, sinon le titre est utilisé)</span>
                  </label>
                  <input id="metaTitle" className={field} value={current.metaTitle} onChange={(e) => updateTr(tab, { metaTitle: e.target.value })} />
                </div>
                <div>
                  <label className={label} htmlFor="metaDescription">
                    Description Google <span className="text-white/40">({(current.metaDescription || "").length}/155, sinon le résumé est utilisé)</span>
                  </label>
                  <textarea id="metaDescription" rows={2} className={field} value={current.metaDescription} onChange={(e) => updateTr(tab, { metaDescription: e.target.value })} />
                </div>
                <div className="rounded-lg bg-white p-4 text-start" aria-label="Aperçu Google">
                  <p className="truncate text-xs text-[#202124]">aymenpromotion-dz.com{publicPath(tab).replace(/\/$/, "")}</p>
                  <p className="truncate text-lg text-[#1a0dab]">{seoTitle || "Titre de l'article"}</p>
                  <p className="line-clamp-2 text-sm text-[#4d5156]">{seoDesc || "Description de l'article…"}</p>
                </div>
              </div>
            </details>
          </div>
        </section>

        {/* ---------- Colonne latérale : publication ---------- */}
        <aside className="space-y-5">
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <span className={label}>Statut</span>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1 text-sm">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateMeta({ status: s })}
                    aria-pressed={meta.status === s}
                    className={`rounded-md py-1.5 transition ${meta.status === s ? (s === "published" ? "bg-emerald-500 text-[#031B17]" : "bg-white/20 text-white") : "text-white/60"}`}
                  >
                    {s === "published" ? "Publié" : "Brouillon"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={label} htmlFor="date">
                Date de l&apos;article
              </label>
              <input id="date" type="date" className={field} value={meta.publishedAt} onChange={(e) => updateMeta({ publishedAt: e.target.value })} />
            </div>
            <div>
              <label className={label} htmlFor="category">
                Catégorie
              </label>
              <select id="category" className={field} value={meta.category} onChange={(e) => updateMeta({ category: e.target.value })}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k} className="bg-[#031B17]">
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="author">
                Auteur
              </label>
              <input id="author" className={field} value={meta.author} onChange={(e) => updateMeta({ author: e.target.value })} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <span className={label}>Image de couverture</span>
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="group relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-dashed border-white/25 bg-white/5"
            >
              {meta.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={backendUrl(meta.coverImage)} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-sm text-white/50">Choisir une image</span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm opacity-0 transition group-hover:opacity-100">Changer</span>
            </button>
            <p className="mt-2 text-xs text-white/40">Format paysage conseillé (1600 × 900), 8 Mo maximum.</p>
            {meta.coverImage && (
              <button type="button" onClick={() => updateMeta({ coverImage: "" })} className="mt-2 text-xs text-white/50 underline hover:text-white">
                Retirer l&apos;image
              </button>
            )}
            <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { void onCover(e.target.files?.[0]); e.target.value = ""; }} />
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <label className={label} htmlFor="slug">
              Adresse de la page
            </label>
            <div className="flex items-center rounded-lg border border-white/15 bg-white/5 text-sm focus-within:border-[#F7C66A]">
              <span className="ps-3 text-white/40">/blog/</span>
              <input
                id="slug"
                className="w-full bg-transparent py-2.5 pe-3 outline-none"
                value={meta.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateMeta({ slug: e.target.value });
                }}
                onBlur={() => updateMeta({ slug: slugify(meta.slug) })}
              />
            </div>
            {!isNew && <p className="mt-2 text-xs text-amber-200/80">Changer l&apos;adresse d&apos;un article publié casse les liens existants.</p>}
          </div>

          {!isNew && (
            <button type="button" onClick={remove} className="w-full rounded-lg border border-red-400/40 py-2 text-sm text-red-300 hover:bg-red-500/10">
              Supprimer l&apos;article
            </button>
          )}
        </aside>
      </div>

      {/* ---------- Barre d'enregistrement ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#031B17]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <p role="status" className={`min-w-0 flex-1 truncate text-sm ${message ? (message.ok ? "text-emerald-300" : "text-red-300") : "text-white/50"}`}>
            {message?.text || (dirty ? "Modifications non enregistrées" : "Tout est enregistré")}
          </p>
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={saving}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
          >
            Enregistrer en brouillon
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={saving}
            className="rounded-lg bg-[#F7C66A] px-5 py-2 text-sm font-semibold text-[#031B17] hover:bg-white disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : meta.status === "published" ? "Mettre à jour" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  );
}
