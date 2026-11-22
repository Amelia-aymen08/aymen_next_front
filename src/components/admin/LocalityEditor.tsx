"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAdminUser } from "./AdminShell";
import { ImageField, LocaleTabs, SaveBar, TEXT_LOCALES, Toggle, card, field, hint, labelCls, type TextLocale } from "./adminUi";
import { adminFetch, type AdminLocality, type LocalityTexts } from "@/lib/adminApi";
import { slugify } from "@/lib/catalogShared";

const EMPTY: LocalityTexts = { name: "", description: "", machineTranslated: false };

const NEW_LOCALITY: AdminLocality = {
  id: 0,
  slug: "",
  name: "",
  city: "Alger",
  description: "",
  imageUrl: "",
  iconImage: "",
  mobileImageUrl: "",
  published: true,
  sortOrder: 0,
  translations: {},
};

type Texts = Record<TextLocale, LocalityTexts>;

const textsOf = (l: AdminLocality): Texts => ({
  fr: { name: l.name, description: l.description },
  en: { ...EMPTY, ...l.translations.en },
  ar: { ...EMPTY, ...l.translations.ar },
});

export default function LocalityEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const user = useAdminUser();
  const isNew = id === null;
  const [loaded, setLoaded] = useState(isNew);
  const [loc, setLoc] = useState<AdminLocality>(NEW_LOCALITY);
  const [texts, setTexts] = useState<Texts>(textsOf(NEW_LOCALITY));
  const [tab, setTab] = useState<TextLocale>("fr");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<TextLocale | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (isNew) return;
    adminFetch<AdminLocality>(`/localities/${id}`)
      .then((data) => {
        setLoc(data);
        setTexts(textsOf(data));
        setLoaded(true);
      })
      .catch((e) => setMessage({ ok: false, text: (e as Error).message }));
  }, [id, isNew]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<AdminLocality>) => {
    setLoc((cur) => ({ ...cur, ...patch }));
    setDirty(true);
    setMessage(null);
  };
  const updateText = (l: TextLocale, patch: Partial<LocalityTexts>) => {
    setTexts((all) => ({ ...all, [l]: { ...all[l], ...patch } }));
    setDirty(true);
    setMessage(null);
  };

  const state = useMemo(
    () =>
      Object.fromEntries(
        TEXT_LOCALES.map((l) => [l, !texts[l].description.trim() ? "empty" : l !== "fr" && texts[l].machineTranslated ? "machine" : "ready"])
      ) as Record<TextLocale, "empty" | "machine" | "ready">,
    [texts]
  );

  const translate = async (to: TextLocale) => {
    if (!texts.fr.description.trim()) {
      setMessage({ ok: false, text: "Rédigez d'abord la description en français." });
      return;
    }
    if (texts[to].description.trim() && !window.confirm("Remplacer le texte existant par une traduction automatique ?")) return;
    setTranslating(to);
    try {
      const out = await adminFetch<{ provider: string; fields: { description?: string; title?: string } }>("/translate", {
        method: "POST",
        body: JSON.stringify({ from: "fr", to, fields: { title: texts.fr.name, description: texts.fr.description } }),
      });
      updateText(to, { name: out.fields.title || texts[to].name, description: out.fields.description || "", machineTranslated: true });
      setMessage({ ok: true, text: `Traduction automatique (${out.provider}) insérée : relisez-la, notamment le nom de la commune.` });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setTranslating(null);
    }
  };

  const save = async () => {
    if (!texts.fr.name.trim()) {
      setMessage({ ok: false, text: "Le nom de la localité est obligatoire." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const has = (t: LocalityTexts) => Boolean(t.name.trim() || t.description.trim());
    const body = {
      ...loc,
      name: texts.fr.name,
      description: texts.fr.description,
      translations: { en: has(texts.en) ? texts.en : null, ar: has(texts.ar) ? texts.ar : null },
    };
    try {
      const saved = await adminFetch<AdminLocality>(isNew ? "/localities" : `/localities/${id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      setLoc(saved);
      setTexts(textsOf(saved));
      setDirty(false);
      setMessage({ ok: true, text: "Enregistré. Le site est mis à jour." });
      if (isNew) router.replace(`/admin/localites/${saved.id}`);
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Supprimer la localité « ${loc.name} » ?`)) return;
    try {
      await adminFetch(`/localities/${id}`, { method: "DELETE" });
      setDirty(false);
      router.replace("/admin/localites");
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  if (!loaded) {
    return message ? <p className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{message.text}</p> : <p className="py-10 text-center text-white/50">Chargement…</p>;
  }

  const current = texts[tab];
  const dir = tab === "ar" ? "rtl" : "ltr";
  const slug = loc.slug || slugify(texts.fr.name);

  return (
    <div className="pb-24">
      <div className="mb-6">
        <Link href="/admin/localites" className="text-sm text-white/50 hover:text-white">
          ← Toutes les localités
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{isNew ? "Nouvelle localité" : loc.name}</h1>
        {slug && <p className="text-sm text-white/50">aymenpromotion-dz.com/localite/{slug}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className={card} aria-labelledby="s-texts">
          <h2 id="s-texts" className="mb-4 font-semibold">
            Textes
          </h2>
          <LocaleTabs tab={tab} onTab={setTab} state={state} onTranslate={translate} translating={translating} />
          {tab !== "fr" && current.machineTranslated && (
            <label className="mb-4 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              <input type="checkbox" className="mt-0.5 accent-[#F7C66A]" checked={false} onChange={() => updateText(tab, { machineTranslated: false })} />
              <span>Traduction automatique : relisez le texte, puis cochez pour la marquer comme relue.</span>
            </label>
          )}
          <div className="space-y-4" dir={dir}>
            <div>
              <label className={labelCls} htmlFor="name">
                Nom de la commune {tab === "fr" && <span className="text-[#F7C66A]">*</span>}
              </label>
              <input id="name" className={`${field} text-lg font-semibold`} value={current.name} onChange={(e) => updateText(tab, { name: e.target.value })} placeholder={tab === "fr" ? "ex. Hydra" : texts.fr.name} />
            </div>
            <div>
              <label className={labelCls} htmlFor="desc">
                Description
              </label>
              <textarea id="desc" rows={10} className={field} value={current.description} onChange={(e) => updateText(tab, { description: e.target.value })} />
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className={`${card} space-y-5`}>
            <ImageField label="Grande image (haut de page)" value={loc.imageUrl} onChange={(v) => update({ imageUrl: v })} folder="localities" help="Format paysage, 1920 px de large conseillé." />
            <ImageField label="Image mobile (facultative)" value={loc.mobileImageUrl} onChange={(v) => update({ mobileImageUrl: v })} folder="localities" aspect="aspect-[3/4]" help="Format portrait ; sinon la grande image est utilisée." />
            <ImageField label="Pictogramme (carte « Localités »)" value={loc.iconImage} onChange={(v) => update({ iconImage: v })} folder="localities" aspect="aspect-square" contain help="Silhouette de la commune, PNG transparent." />
          </div>
          <div className={`${card} space-y-5`}>
            <Toggle checked={loc.published} onChange={(v) => update({ published: v })} label="Visible sur le site" />
            <div>
              <label className={labelCls} htmlFor="order">
                Ordre d&apos;affichage
              </label>
              <input id="order" inputMode="numeric" className={field} value={loc.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value.replace(/[^\d-]/g, "")) || 0 })} />
              <p className={hint}>Les plus petits nombres apparaissent en premier.</p>
            </div>
          </div>
          {!isNew && user?.role === "admin" && (
            <button type="button" onClick={remove} className="w-full rounded-lg border border-red-400/40 py-2 text-sm text-red-300 hover:bg-red-500/10">
              Supprimer la localité
            </button>
          )}
        </aside>
      </div>

      <SaveBar message={message} dirty={dirty} saving={saving} onSave={save} saveLabel={isNew ? "Créer la localité" : "Enregistrer"} />
    </div>
  );
}
