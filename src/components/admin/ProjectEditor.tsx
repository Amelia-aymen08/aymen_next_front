"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAdminUser } from "./AdminShell";
import { GalleryField, ImageField, LocaleTabs, SaveBar, TEXT_LOCALES, Toggle, card, field, hint, labelCls, type TextLocale } from "./adminUi";
import { adminFetch, type AdminLocalityRow, type AdminPlan, type AdminProject, type ProjectStatus, type ProjectTexts } from "@/lib/adminApi";
import { AMENITIES, findAmenity, slugify } from "@/lib/catalogShared";

const EMPTY_TEXTS: ProjectTexts = { shortDescription: "", description: "", typology: "", metaTitle: "", metaDescription: "", machineTranslated: false };

const NEW_PROJECT: AdminProject = {
  id: 0,
  slug: "",
  title: "",
  status: "en_cours",
  address: "",
  localityId: null,
  latitude: null,
  longitude: null,
  progressPercent: 0,
  cardImage: "",
  coverImage: "",
  isNightMode: false,
  published: false,
  sortOrder: 0,
  blocks: "",
  typology: "",
  features: AMENITIES.slice(0, 5).map((a) => a.labels.fr),
  plans: [],
  gallery: [],
  mapEmbedUrl: "",
  mapLinkUrl: "",
  virtualTourUrl: "",
  odooResidenceId: null,
  shortDescription: "",
  description: "",
  metaTitle: "",
  metaDescription: "",
  translations: {},
};

const STATUS_LABELS: Record<ProjectStatus, string> = { en_cours: "En cours", livre: "Livré", bientot: "Avant-première" };

type Texts = Record<TextLocale, ProjectTexts>;

function textsOf(p: AdminProject): Texts {
  return {
    fr: { shortDescription: p.shortDescription, description: p.description, typology: p.typology, metaTitle: p.metaTitle, metaDescription: p.metaDescription },
    en: { ...EMPTY_TEXTS, ...p.translations.en },
    ar: { ...EMPTY_TEXTS, ...p.translations.ar },
  };
}

const hasText = (t: ProjectTexts) => Boolean(t.shortDescription.trim() || t.description.trim());

export default function ProjectEditor({ id }: { id: number | null }) {
  const router = useRouter();
  const user = useAdminUser();
  const isNew = id === null;
  const [loaded, setLoaded] = useState(isNew);
  const [p, setP] = useState<AdminProject>(NEW_PROJECT);
  const [texts, setTexts] = useState<Texts>(textsOf(NEW_PROJECT));
  const [localities, setLocalities] = useState<AdminLocalityRow[]>([]);
  const [tab, setTab] = useState<TextLocale>("fr");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState<TextLocale | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    adminFetch<{ items: AdminLocalityRow[] }>("/localities")
      .then((d) => setLocalities(d.items))
      .catch(() => undefined);
    if (isNew) return;
    adminFetch<AdminProject>(`/projects/${id}`)
      .then((data) => {
        setP(data);
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

  const update = (patch: Partial<AdminProject>) => {
    setP((cur) => ({ ...cur, ...patch, ...(isNew && patch.title !== undefined && !slugTouched ? { slug: slugify(patch.title) } : {}) }));
    setDirty(true);
    setMessage(null);
  };
  const updateText = (l: TextLocale, patch: Partial<ProjectTexts>) => {
    setTexts((all) => ({ ...all, [l]: { ...all[l], ...patch } }));
    setDirty(true);
    setMessage(null);
  };

  const state = useMemo(
    () =>
      Object.fromEntries(TEXT_LOCALES.map((l) => [l, !hasText(texts[l]) ? "empty" : l !== "fr" && texts[l].machineTranslated ? "machine" : "ready"])) as Record<
        TextLocale,
        "empty" | "machine" | "ready"
      >,
    [texts]
  );

  const translate = async (to: TextLocale) => {
    const fr = texts.fr;
    if (!hasText(fr)) {
      setMessage({ ok: false, text: "Rédigez d'abord les textes en français." });
      return;
    }
    if (hasText(texts[to]) && !window.confirm("Cette langue a déjà un texte. Le remplacer par une nouvelle traduction automatique ?")) return;
    setTranslating(to);
    setMessage(null);
    try {
      const fields = Object.fromEntries(Object.entries(fr).filter(([k, v]) => k !== "machineTranslated" && typeof v === "string" && v.trim()));
      const out = await adminFetch<{ provider: string; fields: Partial<ProjectTexts> }>("/translate", {
        method: "POST",
        body: JSON.stringify({ from: "fr", to, fields }),
      });
      updateText(to, { ...EMPTY_TEXTS, ...out.fields, machineTranslated: true });
      setMessage({ ok: true, text: `Traduction automatique (${out.provider}) insérée : relisez-la, puis enregistrez.` });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setTranslating(null);
    }
  };

  const save = async () => {
    if (!p.title.trim()) {
      setMessage({ ok: false, text: "Le nom du projet est obligatoire." });
      return;
    }
    setSaving(true);
    setMessage(null);
    const body = {
      ...p,
      ...texts.fr,
      translations: { en: hasText(texts.en) ? texts.en : null, ar: hasText(texts.ar) ? texts.ar : null },
    };
    try {
      const saved = await adminFetch<AdminProject>(isNew ? "/projects" : `/projects/${id}`, { method: isNew ? "POST" : "PUT", body: JSON.stringify(body) });
      setP(saved);
      setTexts(textsOf(saved));
      setDirty(false);
      setMessage({ ok: true, text: saved.published ? "Enregistré. Le site est mis à jour." : "Enregistré (projet masqué : invisible sur le site)." });
      if (isNew) router.replace(`/admin/projets/${saved.id}`);
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Supprimer définitivement « ${p.title} » ? Préférez « Masquer » si le projet peut revenir.`)) return;
    try {
      await adminFetch(`/projects/${id}`, { method: "DELETE" });
      setDirty(false);
      router.replace("/admin/projets");
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    }
  };

  if (!loaded) {
    return message ? <p className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{message.text}</p> : <p className="py-10 text-center text-white/50">Chargement…</p>;
  }

  const current = texts[tab];
  const dir = tab === "ar" ? "rtl" : "ltr";
  const publicPath = (l: TextLocale) => `${l === "fr" ? "" : `/${l}`}/projet/${p.slug}`;

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/admin/projets" className="text-sm text-white/50 hover:text-white">
            ← Tous les projets
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{isNew ? "Nouveau projet" : p.title}</h1>
        </div>
        {!isNew && p.published && (
          <div className="flex gap-2 text-sm">
            {TEXT_LOCALES.map((l) => (
              <a key={l} href={publicPath(l)} target="_blank" rel="noopener" className="rounded-md border border-white/15 px-3 py-1.5 text-white/70 hover:bg-white/10">
                Voir {l.toUpperCase()} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {/* ---------- Infos principales ---------- */}
          <section className={card} aria-labelledby="s-general">
            <h2 id="s-general" className="mb-4 font-semibold">
              Informations
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="title">
                  Nom de la résidence <span className="text-[#F7C66A]">*</span>
                </label>
                <input id="title" className={`${field} text-lg font-semibold uppercase`} value={p.title} onChange={(e) => update({ title: e.target.value })} placeholder="ex. HÉLÉNITE" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls} htmlFor="slug">
                  Adresse de la page
                </label>
                <div className="flex items-center rounded-lg border border-white/15 bg-white/5 text-sm focus-within:border-[#F7C66A]">
                  <span className="ps-3 text-white/40">aymenpromotion-dz.com/projet/</span>
                  <input
                    id="slug"
                    className="w-full bg-transparent py-2.5 pe-3 outline-none disabled:text-white/60"
                    value={p.slug}
                    disabled={!isNew}
                    onChange={(e) => {
                      setSlugTouched(true);
                      update({ slug: e.target.value });
                    }}
                    onBlur={() => update({ slug: slugify(p.slug) })}
                  />
                </div>
                <p className={hint}>{isNew ? "Choisie à la création, elle ne pourra plus changer (QR codes, liens Google)." : "Fixe : utilisée par les QR codes et les liens Google."}</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="address">
                  Localisation affichée
                </label>
                <input id="address" className={field} value={p.address} onChange={(e) => update({ address: e.target.value })} placeholder="ex. Hydra, Alger" />
              </div>
              <div>
                <label className={labelCls} htmlFor="locality">
                  Page localité
                </label>
                <select id="locality" className={field} value={p.localityId ?? ""} onChange={(e) => update({ localityId: e.target.value ? Number(e.target.value) : null })}>
                  <option value="" className="bg-[#031B17]">
                    — Aucune —
                  </option>
                  {localities.map((l) => (
                    <option key={l.id} value={l.id} className="bg-[#031B17]">
                      {l.name}
                    </option>
                  ))}
                </select>
                <p className={hint}>Le projet apparaît sur la carte de cette localité.</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="blocks">
                  Nombre de blocs
                </label>
                <input id="blocks" className={field} value={p.blocks} onChange={(e) => update({ blocks: e.target.value })} placeholder="ex. 03" />
              </div>
              <div>
                <label className={labelCls} htmlFor="odoo">
                  ID résidence Odoo
                </label>
                <input
                  id="odoo"
                  inputMode="numeric"
                  className={field}
                  value={p.odooResidenceId ?? ""}
                  onChange={(e) => update({ odooResidenceId: e.target.value.trim() ? Number(e.target.value.replace(/\D/g, "")) || null : null })}
                />
                <p className={hint}>Les demandes de devis de cette page arrivent dans cette résidence Odoo.</p>
              </div>
            </div>
          </section>

          {/* ---------- Textes par langue ---------- */}
          <section className={card} aria-labelledby="s-texts">
            <h2 id="s-texts" className="mb-4 font-semibold">
              Textes
            </h2>
            <LocaleTabs tab={tab} onTab={setTab} state={state} onTranslate={translate} translating={translating} />
            {tab !== "fr" && current.machineTranslated && (
              <label className="mb-4 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                <input type="checkbox" className="mt-0.5 accent-[#F7C66A]" checked={false} onChange={() => updateText(tab, { machineTranslated: false })} />
                <span>Traduction automatique : relisez le texte (noms des résidences, termes immobiliers), puis cochez pour la marquer comme relue.</span>
              </label>
            )}
            {tab !== "fr" && !hasText(current) && (
              <p className="mb-4 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
                Sans texte dans cette langue, la page {tab.toUpperCase()} affiche la description française et n&apos;est pas proposée à Google.
              </p>
            )}
            <div className="space-y-4" dir={dir}>
              <div>
                <label className={labelCls} htmlFor="short">
                  Résumé de la carte <span className="text-white/40">({current.shortDescription.length}/{tab === "fr" ? 280 : 400})</span>
                </label>
                <textarea
                  id="short"
                  rows={3}
                  maxLength={tab === "fr" ? 280 : 400}
                  className={field}
                  value={current.shortDescription}
                  onChange={(e) => updateText(tab, { shortDescription: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="desc">
                  Description de la page <span className="text-white/40">(une ligne vide sépare les paragraphes)</span>
                </label>
                <textarea id="desc" rows={12} className={field} value={current.description} onChange={(e) => updateText(tab, { description: e.target.value })} />
              </div>
              <div>
                <label className={labelCls} htmlFor="typo">
                  Typologie résumée <span className="text-white/40">(optionnel, ex. « F2 au F5, Duplex »)</span>
                </label>
                <input id="typo" className={field} value={current.typology} onChange={(e) => updateText(tab, { typology: e.target.value })} />
              </div>
              <details className="rounded-xl border border-white/10 bg-white/[0.03] p-4" dir="ltr">
                <summary className="cursor-pointer text-sm font-medium text-white/80">Référencement Google (optionnel)</summary>
                <div className="mt-4 space-y-4" dir={dir}>
                  <div>
                    <label className={labelCls} htmlFor="mt">
                      Titre Google <span className="text-white/40">({current.metaTitle.length}/60)</span>
                    </label>
                    <input id="mt" className={field} value={current.metaTitle} onChange={(e) => updateText(tab, { metaTitle: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="md">
                      Description Google <span className="text-white/40">({current.metaDescription.length}/155)</span>
                    </label>
                    <textarea id="md" rows={2} className={field} value={current.metaDescription} onChange={(e) => updateText(tab, { metaDescription: e.target.value })} />
                  </div>
                  <p className={hint}>Laissés vides, un titre et une description sont générés à partir du nom et de la commune.</p>
                </div>
              </details>
            </div>
          </section>

          {/* ---------- Photos ---------- */}
          <section className={card} aria-labelledby="s-photos">
            <h2 id="s-photos" className="mb-4 font-semibold">
              Photos
            </h2>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <ImageField
                label="Vignette (cartes de la page Projets)"
                value={p.cardImage}
                onChange={(v) => update({ cardImage: v })}
                folder="projects"
                aspect="aspect-[4/3]"
                contain={!p.isNightMode}
                help={p.isNightMode ? "Photo plein cadre (vue de nuit)." : "Bâtiment détouré (PNG ou WebP transparent)."}
              />
              <ImageField label="Couverture (haut de la page projet)" value={p.coverImage} onChange={(v) => update({ coverImage: v })} folder="projects" aspect="aspect-[4/3]" help="Format paysage, 1600 px de large conseillé." />
            </div>
            <span className={labelCls}>Galerie</span>
            <GalleryField value={p.gallery} onChange={(gallery) => update({ gallery })} folder="projects" />
          </section>

          {/* ---------- Commodités ---------- */}
          <section className={card} aria-labelledby="s-amenities">
            <h2 id="s-amenities" className="mb-1 font-semibold">
              Commodités
            </h2>
            <p className={`${hint} mb-4`}>Traduites automatiquement en anglais et en arabe sur le site.</p>
            <AmenitiesPicker value={p.features} onChange={(features) => update({ features })} />
          </section>

          {/* ---------- Typologies ---------- */}
          <section className={card} aria-labelledby="s-plans">
            <h2 id="s-plans" className="mb-1 font-semibold">
              Typologies et surfaces
            </h2>
            <p className={`${hint} mb-4`}>Écrivez les surfaces en français (« de 77 m² à 118 m² », « 202 m² », « Consultable ») : elles sont traduites sur le site.</p>
            <PlansEditor value={p.plans} onChange={(plans) => update({ plans })} />
          </section>

          {/* ---------- Carte & visite ---------- */}
          <section className={card} aria-labelledby="s-map">
            <h2 id="s-map" className="mb-4 font-semibold">
              Carte et visite virtuelle
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="embed">
                  Carte Google Maps
                </label>
                <textarea
                  id="embed"
                  rows={3}
                  className={`${field} font-mono text-xs`}
                  value={p.mapEmbedUrl}
                  onChange={(e) => update({ mapEmbedUrl: e.target.value })}
                  placeholder='Google Maps → Partager → « Intégrer une carte » → copiez le code <iframe …> et collez-le ici'
                />
              </div>
              <div>
                <label className={labelCls} htmlFor="maplink">
                  Lien « Voir sur la carte » / itinéraire
                </label>
                <input id="maplink" className={field} value={p.mapLinkUrl} onChange={(e) => update({ mapLinkUrl: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor="lat">
                    Latitude
                  </label>
                  <input id="lat" inputMode="decimal" className={field} value={p.latitude ?? ""} onChange={(e) => update({ latitude: e.target.value === "" ? null : (e.target.value as unknown as number) })} placeholder="36.743" />
                </div>
                <div>
                  <label className={labelCls} htmlFor="lng">
                    Longitude
                  </label>
                  <input id="lng" inputMode="decimal" className={field} value={p.longitude ?? ""} onChange={(e) => update({ longitude: e.target.value === "" ? null : (e.target.value as unknown as number) })} placeholder="3.036" />
                </div>
                <p className={`${hint} sm:col-span-2`}>Position du repère sur la carte de la page localité (clic droit sur Google Maps → copier les coordonnées).</p>
              </div>
              <div>
                <label className={labelCls} htmlFor="tour">
                  Visite virtuelle 360° (lien)
                </label>
                <input id="tour" className={field} value={p.virtualTourUrl} onChange={(e) => update({ virtualTourUrl: e.target.value })} placeholder="https://my.matterport.com/show/?m=…" />
              </div>
            </div>
          </section>
        </div>

        {/* ---------- Colonne latérale ---------- */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className={`${card} space-y-5`}>
            <div>
              <span className={labelCls}>Statut</span>
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1 text-sm">
                {(Object.keys(STATUS_LABELS) as ProjectStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={p.status === s}
                    onClick={() => update({ status: s, ...(s === "livre" ? { progressPercent: 100 } : {}) })}
                    className={`rounded-md px-1 py-1.5 transition ${p.status === s ? "bg-[#F7C66A] font-semibold text-[#031B17]" : "text-white/60 hover:text-white"}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            {p.status === "en_cours" && (
              <div>
                <label className={labelCls} htmlFor="progress">
                  Avancement des travaux
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={p.progressPercent ?? 0}
                    onChange={(e) => update({ progressPercent: Number(e.target.value) })}
                    className="flex-1 accent-[#F7C66A]"
                    aria-label="Avancement (curseur)"
                  />
                  <div className="flex items-center rounded-lg border border-white/15 bg-white/5 focus-within:border-[#F7C66A]">
                    <input
                      id="progress"
                      inputMode="numeric"
                      className="w-12 bg-transparent py-2 text-end font-semibold outline-none"
                      value={p.progressPercent ?? ""}
                      onChange={(e) => {
                        const n = e.target.value.replace(/\D/g, "");
                        update({ progressPercent: n === "" ? null : Math.min(100, Number(n)) });
                      }}
                    />
                    <span className="pe-2 text-white/50">%</span>
                  </div>
                </div>
              </div>
            )}
            <Toggle checked={p.published} onChange={(v) => update({ published: v })} label="Visible sur le site" help="Décochez pour masquer sans supprimer." />
            <Toggle checked={p.isNightMode} onChange={(v) => update({ isNightMode: v })} label="Carte « vue de nuit »" help="Photo plein cadre au lieu du bâtiment détouré." />
            <div>
              <label className={labelCls} htmlFor="order">
                Ordre d&apos;affichage
              </label>
              <input id="order" inputMode="numeric" className={field} value={p.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value.replace(/[^\d-]/g, "")) || 0 })} />
              <p className={hint}>Les plus petits nombres apparaissent en premier.</p>
            </div>
          </div>
          {!isNew && user?.role === "admin" && (
            <button type="button" onClick={remove} className="w-full rounded-lg border border-red-400/40 py-2 text-sm text-red-300 hover:bg-red-500/10">
              Supprimer le projet
            </button>
          )}
        </aside>
      </div>

      <SaveBar message={message} dirty={dirty} saving={saving} onSave={save} saveLabel={isNew ? "Créer le projet" : "Enregistrer"} />
    </div>
  );
}

function AmenitiesPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState("");
  const known = new Set(value.map((v) => findAmenity(v)?.key).filter(Boolean));
  const others = value.filter((v) => !findAmenity(v));
  const toggle = (label: string, key: string, on: boolean) =>
    onChange(on ? [...value, label] : value.filter((v) => findAmenity(v)?.key !== key));

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {AMENITIES.map((a) => (
          <label key={a.key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5">
            <input type="checkbox" className="accent-[#F7C66A]" checked={known.has(a.key)} onChange={(e) => toggle(a.labels.fr, a.key, e.target.checked)} />
            {a.labels.fr}
          </label>
        ))}
      </div>
      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <span key={o} className="flex items-center gap-2 rounded-full border border-amber-400/40 px-3 py-1 text-xs text-amber-200" title="Hors liste : affichée en français dans toutes les langues">
              {o}
              <button type="button" aria-label={`Retirer ${o}`} onClick={() => onChange(value.filter((v) => v !== o))}>
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <input className={field} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Autre commodité (non traduite)" />
        <button
          type="button"
          onClick={() => {
            const v = custom.trim();
            if (v && !value.includes(v)) onChange([...value, v]);
            setCustom("");
          }}
          className="rounded-lg border border-white/20 px-4 text-sm hover:bg-white/10"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

function PlansEditor({ value, onChange }: { value: AdminPlan[]; onChange: (v: AdminPlan[]) => void }) {
  const [openRooms, setOpenRooms] = useState<number | null>(null);
  const set = (i: number, patch: Partial<AdminPlan>) => onChange(value.map((pl, k) => (k === i ? { ...pl, ...patch } : pl)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((pl, i) => (
        <div key={i} className="rounded-lg border border-white/10 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input className={`${field} w-28`} value={pl.type} onChange={(e) => set(i, { type: e.target.value })} placeholder="F3" aria-label={`Type du plan ${i + 1}`} />
            <input className={`${field} min-w-0 flex-1`} value={pl.area} onChange={(e) => set(i, { area: e.target.value })} placeholder="de 96 m² à 147 m²" aria-label={`Surface du plan ${i + 1}`} />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-2 py-1 text-white/60 hover:bg-white/10 disabled:opacity-30" aria-label="Monter">
              ↑
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="rounded px-2 py-1 text-white/60 hover:bg-white/10 disabled:opacity-30" aria-label="Descendre">
              ↓
            </button>
            <button type="button" onClick={() => onChange(value.filter((_, k) => k !== i))} className="rounded px-2 py-1 text-red-300 hover:bg-red-500/20" aria-label="Supprimer ce plan">
              ✕
            </button>
          </div>
          <button type="button" onClick={() => setOpenRooms(openRooms === i ? null : i)} className="mt-2 text-xs text-white/50 underline hover:text-white">
            {openRooms === i ? "Masquer" : "Détail des pièces"} ({pl.rooms?.length || 0})
          </button>
          {openRooms === i && (
            <div className="mt-2 space-y-2 border-s border-white/10 ps-3">
              {(pl.rooms || []).map((r, k) => (
                <div key={k} className="flex gap-2">
                  <input
                    className={`${field} flex-1 py-1.5 text-sm`}
                    value={r.name}
                    placeholder="Séjour"
                    aria-label="Pièce"
                    onChange={(e) => set(i, { rooms: (pl.rooms || []).map((x, n) => (n === k ? { ...x, name: e.target.value } : x)) })}
                  />
                  <input
                    className={`${field} w-32 py-1.5 text-sm`}
                    value={r.area}
                    placeholder="24,15 m²"
                    aria-label="Surface de la pièce"
                    onChange={(e) => set(i, { rooms: (pl.rooms || []).map((x, n) => (n === k ? { ...x, area: e.target.value } : x)) })}
                  />
                  <button type="button" onClick={() => set(i, { rooms: (pl.rooms || []).filter((_, n) => n !== k) })} className="px-2 text-red-300" aria-label="Supprimer la pièce">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => set(i, { rooms: [...(pl.rooms || []), { name: "", area: "" }] })} className="text-xs text-[#F7C66A] hover:underline">
                + Ajouter une pièce
              </button>
            </div>
          )}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { type: "", area: "" }])} className="rounded-lg border border-dashed border-white/25 px-4 py-2 text-sm text-white/70 hover:border-[#F7C66A] hover:text-[#F7C66A]">
        + Ajouter une typologie
      </button>
    </div>
  );
}
