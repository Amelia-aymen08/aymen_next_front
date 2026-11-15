"use client";

import { useEffect, useState } from "react";
import { LocaleLink, useT } from "@/i18n/client";
import HamburgerIcon from "@/components/icons/HamburgerIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import MenuOverlay from "./MenuOverlay";

export default function Header({ logoSrc = "/logo_original.svg", className = "" }: { logoSrc?: string; className?: string }) {
  const t = useT("header");
  const tm = useT("meta");
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed start-0 top-0 z-50 w-full transition-all duration-300 ${
          isScrolled ? "bg-[#031B17]/95 py-2 shadow-lg backdrop-blur-md" : "bg-transparent py-4"
        } ${className}`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-10">
          <LocaleLink href="/">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo, pas d'optimisation utile */}
            <img
              src={logoSrc}
              alt={tm("logoAlt")}
              className={`w-auto transition-all duration-300 ${isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"}`}
              draggable={false}
              fetchPriority="high"
              width={200}
              height={56}
            />
          </LocaleLink>

          <div className="flex items-center gap-5">
            <LanguageSwitcher className="hidden sm:flex" />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex items-center gap-3 text-white/90"
              aria-label={t("openMenu")}
              aria-expanded={open}
            >
              <span className="text-base font-medium">{t("menu")}</span>
              <span className="text-white/50">|</span>
              <HamburgerIcon className="h-6 w-7 text-white rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      </header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
