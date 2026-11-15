"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LocaleLink, useT } from "@/i18n/client";
import LanguageSwitcher from "./LanguageSwitcher";

const LINKS = [
  { key: "projects", href: "/projets" },
  { key: "virtualTour", href: "/visite-virtuelle" },
  { key: "localities", href: "/projets?tab=localites" },
  { key: "land", href: "/terrain" },
  { key: "about", href: "/a-propos" },
  { key: "aymag", href: "/aymag" },
  { key: "catalogue", href: "/catalogue" },
  { key: "blog", href: "/blog" },
  { key: "careers", href: "/carriere" },
  { key: "contact", href: "/contact" },
] as const;

const SOCIALS = [
  { label: "Facebook", href: "https://www.facebook.com/aymenpromotionimmobiliere", icon: "fa-brands fa-facebook-f" },
  { label: "Instagram", href: "https://www.instagram.com/aymenpromotion/", icon: "fa-brands fa-instagram" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/aymen-promotion-immobiliere", icon: "fa-brands fa-linkedin-in" },
  { label: "YouTube", href: "https://www.youtube.com/@aymenpromotionimmobiliere6948", icon: "fa-brands fa-youtube" },
  { label: "TikTok", href: "https://www.tiktok.com/@aymenpromotionimmo", icon: "fa-brands fa-tiktok" },
  { label: "X", href: "https://x.com/AymenPromotion", icon: "fa-brands fa-x-twitter" },
];

// Décalage d'entrée : vers la gauche en LTR, vers la droite en RTL.
const HIDDEN_SHIFT = "opacity-0 ltr:-translate-x-3 rtl:translate-x-3";

export default function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT("header");
  const tn = useT("nav");
  const [mounted, setMounted] = useState(open);

  // Garde le menu monté le temps de l'animation de sortie.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), 420);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!(open || mounted)) return null;

  const overlay = (
    <div
      className={`fixed inset-0 z-[5000] transition-opacity duration-[420ms] ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={t("menu")}
    >
      <button
        type="button"
        aria-label={t("closeMenu")}
        onClick={onClose}
        className={`absolute inset-0 h-full w-full bg-black/30 backdrop-blur-[1.5px] transition-opacity duration-[420ms] ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panneau : à gauche en LTR, à droite en RTL */}
      <aside
        className={`absolute start-0 top-0 h-full w-[50vw] min-w-[340px] max-w-[720px] border-e border-white/10 bg-black/[.28] shadow-[0_18px_55px_rgba(0,0,0,.55)] backdrop-blur-[10px] transition-all duration-[420ms] ease-out ${
          open ? "translate-x-0 opacity-100" : "opacity-0 ltr:-translate-x-6 rtl:translate-x-6"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/25" />

        <div className="relative flex items-start justify-between px-7 pt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_original.svg" alt="Aymen Promotion" className="h-11 w-auto opacity-95" draggable={false} />
          <button
            type="button"
            onClick={onClose}
            className="grid h-14 w-14 place-items-center text-white/90 transition hover:text-white"
            aria-label={t("close")}
          >
            <XCloseIcon />
          </button>
        </div>

        <div className="relative flex h-[calc(100%-120px)] flex-col justify-center px-10">
          <div className="ms-auto w-[72%] max-w-[360px] text-end">
            <div
              className={`text-[44px] font-semibold tracking-[0.22em] text-white/90 transition-all duration-[400ms] ease-out ${
                open ? "translate-x-0 opacity-100" : HIDDEN_SHIFT
              }`}
              style={{ transitionDelay: open ? "40ms" : "0ms" }}
            >
              {t("menu").toUpperCase()}
            </div>

            <nav className="mt-9 flex flex-col gap-4">
              {LINKS.map((l, idx) => (
                <LocaleLink
                  key={l.key}
                  href={l.href}
                  onClick={onClose}
                  className={`group relative inline-block text-[16px] tracking-[0.22em] text-white/70 transition-all duration-[400ms] ease-out hover:text-white/95 ${
                    open ? "translate-x-0 opacity-100" : HIDDEN_SHIFT
                  }`}
                  style={{ transitionDelay: open ? `${80 + idx * 60}ms` : "0ms" }}
                >
                  <span className="relative transition-transform duration-200 group-hover:text-[#F7C66A] ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
                    {tn(l.key).toUpperCase()}
                  </span>
                  <span
                    className="pointer-events-none absolute bottom-[-6px] start-0 h-[1px] w-0 bg-[#F7C66A] transition-all duration-200 group-hover:w-full ltr:origin-left rtl:origin-right"
                    aria-hidden
                  />
                </LocaleLink>
              ))}
            </nav>

            <LanguageSwitcher className="mt-10 justify-end" onNavigate={onClose} />

            <div className="mt-8 flex items-center justify-end gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  title={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/75 ring-1 ring-white/15 backdrop-blur-[6px] transition hover:bg-white/15 hover:text-white"
                >
                  <i className={`${s.icon} text-[18px]`} aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  return createPortal(overlay, document.body);
}

function XCloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="opacity-95" aria-hidden>
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
