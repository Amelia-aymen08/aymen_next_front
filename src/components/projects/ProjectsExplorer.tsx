"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale, useT } from "@/i18n/client";
import { planTypeLabel, type LocalityPublic, type ProjectSummary } from "@/lib/catalogShared";
import { LocalityCard, NightProjectCard, ProjectCard } from "./ProjectCards";

export type ProjectsTab = "en_cours" | "livre" | "localites";

const PAGE_SIZE = 9;
const TYPOLOGIES = ["F2", "F3", "F4", "F5", "DUPLEX", "TRIPLEX", "STUDIO"];

/** ?tab=localites | finis | en-cours (liens du menu, partage). */
export function tabFromQuery(value: string | null): ProjectsTab {
  if (value === "localites" || value === "localities") return "localites";
  if (value === "finis" || value === "livre") return "livre";
  return "en_cours";
}
const QUERY_OF: Record<ProjectsTab, string | null> = { en_cours: null, livre: "finis", localites: "localites" };

function ChevronDownIcon() {
  return (
    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" aria-hidden>
      <path d="M1 1L6 6L11 1" stroke="#F7C66A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const t = useT("projects");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const current = options.find((o) => o.value === value);
  const choices = [{ value: null as string | null, label: t("filterAll") }, ...options];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-4 rounded border-[0.2px] border-[#F7C66A] px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition hover:bg-[#F7C66A]/10 ${open ? "bg-[#F7C66A]/10" : ""}`}
      >
        {current ? current.label : label}
        <ChevronDownIcon />
      </button>
      {open && (
        <ul role="listbox" aria-label={label} className="absolute start-0 top-full z-50 mt-2 max-h-60 w-48 overflow-y-auto rounded border border-[#F7C66A]/30 bg-[#031B17] shadow-xl">
          {choices.map((o) => (
            <li key={o.value ?? "*"} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`block w-full px-4 py-2 text-start text-xs transition-colors hover:bg-[#F7C66A] hover:text-[#031B17] ${o.value === value ? "text-[#F7C66A]" : "text-white"}`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Props = { projects: ProjectSummary[]; localities: LocalityPublic[]; initialTab?: ProjectsTab };

/** Version rendue au serveur (HTML indexé) : onglet par défaut, sans lecture de l'URL. */
export default function ProjectsExplorer({ projects, localities, initialTab = "en_cours" }: Props) {
  return <Explorer projects={projects} localities={localities} tab={initialTab} />;
}

/** Version interactive : l'onglet suit ?tab= (liens du menu « Localités », partage de lien). */
export function ProjectsExplorerFromUrl({ projects, localities }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = tabFromQuery(params.get("tab"));
  const setTab = (next: ProjectsTab) => {
    const q = QUERY_OF[next];
    router.replace(q ? `${pathname}?tab=${q}` : pathname, { scroll: false });
  };
  return <Explorer projects={projects} localities={localities} tab={tab} onTabChange={setTab} />;
}

function Explorer({
  projects,
  localities,
  tab,
  onTabChange,
}: {
  projects: ProjectSummary[];
  localities: LocalityPublic[];
  tab: ProjectsTab;
  onTabChange?: (t: ProjectsTab) => void;
}) {
  const t = useT("projects");
  const locale = useLocale();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [typology, setTypology] = useState<string | null>(null);
  const [place, setPlace] = useState<string | null>(null);

  useEffect(() => setVisible(PAGE_SIZE), [tab, typology, place]);

  const places = useMemo(
    () =>
      [...new Set(projects.map((p) => p.cityLabel).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, locale))
        .map((c) => ({ value: c, label: c })),
    [projects, locale]
  );
  const typologyOptions = TYPOLOGIES.map((v) => ({ value: v, label: planTypeLabel(v, locale) }));

  const filtered = useMemo(() => {
    if (tab === "localites") return [];
    return projects.filter((p) => {
      const inTab = tab === "livre" ? p.status === "livre" : p.status !== "livre";
      if (!inTab) return false;
      if (place && p.cityLabel !== place) return false;
      if (typology) {
        const inPlans = p.planTypes.some((type) => type.toUpperCase().includes(typology));
        if (!inPlans && !p.shortDescription.toUpperCase().includes(typology)) return false;
      }
      return true;
    });
  }, [projects, tab, place, typology]);

  const tabs: { key: ProjectsTab; label: string }[] = [
    { key: "livre", label: t("tabDone") },
    { key: "en_cours", label: t("tabOngoing") },
    { key: "localites", label: t("tabLocalities") },
  ];

  return (
    <>
      <h1 className="mb-8 animate-fadeInUp text-center text-4xl font-bold uppercase tracking-wider text-[#F7C66A] md:text-5xl">
        {tab === "localites" ? t("headingLocalities") : t("headingProjects")}
      </h1>

      <div className="mb-12 flex animate-fadeInUp justify-center" style={{ animationDelay: "0.1s" }}>
        <div role="tablist" className="flex gap-6 text-lg font-bold uppercase tracking-widest md:gap-12 md:text-2xl">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => onTabChange?.(key)}
              className={`relative pb-2 transition-all ${tab === key ? "text-[#F7C66A]" : "text-white/60 hover:text-white"}`}
            >
              {label}
              {tab === key && <span className="absolute bottom-0 start-0 h-[3px] w-full bg-[#F7C66A] shadow-[0_0_15px_#F7C66A]" />}
            </button>
          ))}
        </div>
      </div>

      {tab !== "localites" && (
        <div className="relative z-20 mb-10 flex animate-fadeInUp flex-wrap justify-center gap-4" style={{ animationDelay: "0.2s" }}>
          <FilterDropdown label={t("filterTypology")} options={typologyOptions} value={typology} onChange={setTypology} />
          <FilterDropdown label={t("filterLocality")} options={places} value={place} onChange={setPlace} />
        </div>
      )}

      {tab === "localites" ? (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {localities.map((l, i) => (
            <LocalityCard key={l.id} locality={l} style={{ animationDelay: `${0.1 + i * 0.08}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-white/70">
          <p>{t("noResults")}</p>
          {(typology || place) && (
            <button
              type="button"
              onClick={() => {
                setTypology(null);
                setPlace(null);
              }}
              className="mt-4 text-sm font-bold uppercase tracking-widest text-[#F7C66A] underline-offset-4 hover:underline"
            >
              {t("resetFilters")}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, visible).map((p, i) => {
            const style = { animationDelay: `${0.1 + (i % PAGE_SIZE) * 0.1}s` };
            return p.isNightMode ? <NightProjectCard key={p.id} project={p} style={style} /> : <ProjectCard key={p.id} project={p} style={style} />;
          })}
        </div>
      )}

      {tab !== "localites" && visible < filtered.length && (
        <div className="mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="border border-[#F7C66A] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#F7C66A] hover:text-[#031B17]"
          >
            {t("seeMore")}
          </button>
        </div>
      )}
    </>
  );
}
