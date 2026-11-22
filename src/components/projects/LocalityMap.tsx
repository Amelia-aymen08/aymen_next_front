"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { LocaleLink, useT } from "@/i18n/client";
import { assetUrl, projectHref, type ProjectSummary } from "@/lib/catalogShared";
import { LocationPinIcon } from "./ProjectCards";

const MapView = dynamic(() => import("./LocalityMapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#052620]" aria-hidden />,
});

/** Carte des projets d'une localité + liste cliquable (la carte se recentre sur le projet choisi). */
export default function LocalityMap({ projects }: { projects: ProjectSummary[] }) {
  const t = useT("projects");
  const [selected, setSelected] = useState<ProjectSummary | null>(projects[0] ?? null);

  return (
    <div className="relative flex w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#052620] shadow-2xl md:h-[600px] md:flex-row">
      <div className="relative z-0 h-[360px] w-full md:h-full md:w-2/3">
        <MapView projects={projects} selected={selected} onSelect={setSelected} />
      </div>
      <div className="relative z-10 flex h-[480px] w-full flex-col border-white/5 bg-[#0F2520] shadow-[-10px_0_20px_rgba(0,0,0,0.2)] md:h-full md:w-1/3 md:border-s">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-[#F7C66A]">{t("mapProjects", { count: projects.length })}</h2>
          <p className="mt-1 text-xs text-white/50">{t("mapHint")}</p>
        </div>
        <ul className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-6">
          {projects.map((p) => {
            const active = selected?.id === p.id;
            const directions = p.mapLinkUrl || (p.lat && p.lng ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : null);
            return (
              <li key={p.id}>
                <div
                  className={`group flex flex-col gap-3 rounded-2xl border p-4 transition-all ${
                    active ? "scale-[1.02] border-[#F7C66A] bg-[#0A2F25] shadow-lg" : "border-transparent bg-white/5 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <button type="button" onClick={() => setSelected(p)} aria-pressed={active} className="flex items-start gap-4 text-start">
                    <span className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={assetUrl(p.cardImage || p.coverImage)} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1 pt-1">
                      <span className={`block text-sm font-bold uppercase leading-tight ${active ? "text-white" : "text-white/90"}`}>{p.title}</span>
                      <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#F7C66A]">
                        <LocationPinIcon />
                        <span className="truncate">{p.cityLabel}</span>
                      </span>
                    </span>
                  </button>
                  <div className="mt-1 flex items-center justify-between border-t border-white/5 pt-2">
                    <LocaleLink href={projectHref(p.slug)} className="text-[10px] font-bold uppercase tracking-widest text-white/70 transition-colors hover:text-[#F7C66A]">
                      {t("discover")}
                    </LocaleLink>
                    {directions ? (
                      <a
                        href={directions}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#F7C66A] transition-colors hover:text-white"
                      >
                        {t("directions")}
                        <i className="fa-solid fa-arrow-right text-[9px] rtl:rotate-180" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
