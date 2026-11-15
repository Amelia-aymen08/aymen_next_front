"use client";

import { useState } from "react";
import { LocaleLink, useT } from "@/i18n/client";

const ITEMS = [
  { id: "phone", icon: "fa-phone" },
  { id: "write", icon: "fa-pen-to-square" },
  { id: "contact", icon: "fa-calendar-days" },
] as const;

/**
 * Barre de contact flottante, collée au bord de l'écran
 * (droite en LTR, gauche en RTL). Le panneau s'ouvre vers l'intérieur.
 */
export default function StickyContactBar() {
  const t = useT("contactBar");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const close = () => {
    setPinnedIndex(null);
    setHoveredIndex(null);
  };

  return (
    <div className="fixed end-0 top-1/2 z-[100] flex -translate-y-1/2 flex-col gap-3">
      {ITEMS.map((item, index) => {
        const isOpen = pinnedIndex === index || hoveredIndex === index;
        const toggle = () => {
          if (pinnedIndex === index) return close();
          setPinnedIndex(index);
          setHoveredIndex(index);
        };

        return (
          <div
            key={item.id}
            className="relative flex items-center justify-end"
            onMouseEnter={() => pinnedIndex === null && setHoveredIndex(index)}
            onMouseLeave={() => pinnedIndex === null && setHoveredIndex(null)}
          >
            <div
              className={`absolute end-[85%] flex h-full items-center overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                isOpen ? "w-auto translate-x-0 opacity-100" : "w-0 opacity-0 ltr:translate-x-4 rtl:-translate-x-4"
              }`}
            >
              <div className="flex min-h-[50px] items-center gap-4 whitespace-nowrap rounded-s-xl border border-white/10 bg-[#0C2A24]/90 px-4 py-3 shadow-[0_0_20px_rgba(247,198,106,0.15)] backdrop-blur-md">
                {item.id === "phone" && (
                  <a
                    href="tel:+213560582959"
                    onClick={close}
                    className="flex items-center gap-2 font-medium tracking-wide text-white hover:text-[#F7C66A]"
                  >
                    <span className="text-[#F7C66A]">
                      <i className="fa-solid fa-phone" aria-hidden />
                    </span>
                    {t("call")}
                  </a>
                )}

                {item.id === "write" && (
                  <div className="flex items-center gap-6">
                    <a
                      href="mailto:contact@aymenpromotion.com"
                      onClick={close}
                      className="flex items-center gap-2 text-white transition-colors hover:text-[#F7C66A]"
                    >
                      <i className="fa-solid fa-envelope text-[#F7C66A]" aria-hidden />
                      <span className="text-sm font-medium">{t("email")}</span>
                    </a>
                    <div className="h-4 w-px bg-white/20" />
                    <a
                      href="https://wa.me/213560582959"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={close}
                      className="flex items-center gap-2 text-white transition-colors hover:text-[#25D366]"
                    >
                      <i className="fa-brands fa-whatsapp text-lg text-[#25D366]" aria-hidden />
                      <span className="text-sm font-medium">{t("whatsapp")}</span>
                    </a>
                  </div>
                )}

                {item.id === "contact" && (
                  <LocaleLink
                    href="/contact"
                    onClick={close}
                    className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-white hover:text-[#F7C66A]"
                  >
                    <span className="text-[#F7C66A]">
                      <i className="fa-solid fa-calendar-check" aria-hidden />
                    </span>
                    {t("appointment")}
                  </LocaleLink>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={toggle}
              aria-expanded={isOpen}
              aria-label={item.id === "phone" ? t("call") : item.id === "write" ? `${t("email")} / ${t("whatsapp")}` : t("appointment")}
              className={`group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-s-xl border-y border-s border-white/20 bg-[#0C2A24]/40 shadow-lg backdrop-blur-md transition-all duration-300 md:h-14 md:w-14 ${
                isOpen ? "border-[#F7C66A] bg-[#F7C66A] text-[#031B17]" : "text-white hover:bg-white/10"
              }`}
            >
              <div
                className={`absolute inset-0 rounded-s-xl bg-[#F7C66A]/20 opacity-0 transition-opacity duration-500 ${
                  isOpen ? "animate-pulse opacity-100" : ""
                }`}
              />
              <i
                className={`fa-solid ${item.icon} relative z-10 text-base transition-transform duration-300 md:text-xl ${
                  isOpen ? "scale-110" : ""
                }`}
                aria-hidden
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
