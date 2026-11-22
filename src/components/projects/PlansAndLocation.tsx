"use client";

import { useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { areaLabel, areaNumber, planTypeLabel, roomLabel, type ProjectPlan } from "@/lib/catalogShared";

type Props = {
  plans: ProjectPlan[];
  mapEmbedUrl: string | null;
  mapUrl: string;
  place: string;
};

/** Typologies (avec détail des pièces dépliable) + carte de localisation. */
export default function PlansAndLocation({ plans, mapEmbedUrl, mapUrl, place }: Props) {
  const t = useT("projects");
  const locale = useLocale();
  const [open, setOpen] = useState<number | null>(null);

  // Tri par surface croissante ; si une typologie n'a pas de surface chiffrée, l'ordre saisi est gardé.
  const sorted = plans.every((p) => areaNumber(p.area) > 0) ? [...plans].sort((a, b) => areaNumber(a.area) - areaNumber(b.area)) : plans;
  const box =
    "flex min-h-[70px] w-full max-w-sm items-center justify-center rounded-xl border border-[#F7C66A]/50 px-8 py-5 text-center transition-all hover:border-[#F7C66A] hover:bg-[#F7C66A]/5";

  return (
    <section className={`mx-auto grid max-w-7xl gap-10 px-6 py-20 ${plans.length ? "md:grid-cols-2" : ""}`}>
      {plans.length > 0 && (
        <div className="flex flex-col rounded-3xl border border-white/5 bg-[#052620] p-8 shadow-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide">{t("typologies")}</h2>
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {sorted.map((p, i) => {
              const area = areaLabel(p.area, locale);
              const label = (
                <span className="text-xl font-medium text-white md:text-2xl">
                  <span className="me-3 font-bold text-[#F7C66A]">{planTypeLabel(p.type, locale)}</span>
                  {area && !/consultable/i.test(p.area) ? area : ""}
                </span>
              );
              if (!p.rooms?.length) {
                return (
                  <div key={i} className={box}>
                    {label}
                  </div>
                );
              }
              const isOpen = open === i;
              return (
                <div key={i} className="w-full max-w-sm">
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className={`${box} gap-3 ${isOpen ? "border-[#F7C66A] bg-[#F7C66A]/5" : ""}`}>
                    {label}
                    <i className={`fa-solid fa-chevron-down text-xs text-[#F7C66A] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                  {isOpen && (
                    <table className="mt-2 w-full overflow-hidden rounded-xl text-sm">
                      <caption className="sr-only">{t("roomsCaption", { type: planTypeLabel(p.type, locale) })}</caption>
                      <thead>
                        <tr className="bg-[#F7C66A]/15 text-start text-[11px] uppercase tracking-wider text-[#F7C66A]">
                          <th scope="col" className="px-4 py-2 text-start font-bold">
                            {t("roomSpace")}
                          </th>
                          <th scope="col" className="px-4 py-2 text-end font-bold">
                            {t("roomArea")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.rooms.map((r) => (
                          <tr key={r.name} className="border-b border-white/10 last:border-0">
                            <td className="px-4 py-2 text-white/80">{roomLabel(r.name, locale)}</td>
                            <td className="whitespace-nowrap px-4 py-2 text-end text-white">{areaLabel(r.area, locale)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col rounded-3xl border border-[#0A84FF] bg-[#052620] p-8 shadow-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-wide">{t("location")}</h2>
        <div className="group relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-[#031B17]">
          {mapEmbedUrl ? (
            <>
              <iframe
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t("mapTitle", { place })}
                className="h-full w-full"
              />
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 focus-visible:opacity-100 group-hover:opacity-100"
              >
                <MapButton label={t("seeOnMap")} />
              </a>
            </>
          ) : (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sections/map-placeholder.png"
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-40"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <MapButton label={t("seeOnMap")} />
              </span>
            </a>
          )}
        </div>
        {place && <p className="mt-6 text-center text-sm leading-relaxed text-white/70">{place}</p>}
      </div>
    </section>
  );
}

function MapButton({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-3 rounded-full bg-[#F7C66A] px-6 py-3 text-[#031B17] shadow-lg transition-transform duration-300 hover:scale-105">
      <i className="fa-solid fa-location-dot text-lg" aria-hidden />
      <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
    </span>
  );
}
