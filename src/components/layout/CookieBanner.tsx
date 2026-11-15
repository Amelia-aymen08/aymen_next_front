"use client";

import { useEffect, useState } from "react";
import { LocaleLink, useT } from "@/i18n/client";

const STORAGE_KEY = "aymen_cookie_consent";

function readConsent(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeConsent(value: "accepted" | "declined") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // navigation privée : on ne mémorise pas, sans bloquer
  }
}

export default function CookieBanner() {
  const t = useT("cookie");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (readConsent()) return;
    const timer = window.setTimeout(() => setIsVisible(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    writeConsent("accepted");
    setIsVisible(false);
    window.dispatchEvent(new Event("cookie_consent_accepted"));
  };

  const handleDecline = () => {
    writeConsent("declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 start-0 z-[100] w-full animate-fadeInUp" role="region" aria-label={t("title")}>
      <div className="border-t border-white/10 bg-[#031B17]/95 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] backdrop-blur-md md:p-6">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex-1 text-center md:text-start">
            <h3 className="mb-1 flex items-center justify-center gap-2 text-lg font-bold text-[#F7C66A] md:justify-start">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 15.5v.01" />
                <path d="M12 12v.01" />
                <path d="M11 17v.01" />
                <path d="M7 14v.01" />
              </svg>
              {t("title")}
            </h3>
            <p className="text-sm leading-relaxed text-white/80">
              {t("text")}{" "}
              <LocaleLink href="/confidentialite" className="font-medium text-[#F7C66A] hover:underline">
                {t("learnMore")}
              </LocaleLink>
            </p>
          </div>

          <div className="flex min-w-max flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleDecline}
              className="w-full rounded-full border border-white/20 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white/90 transition-colors hover:bg-white/10 sm:w-auto"
            >
              {t("decline")}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="w-full rounded-full border border-[#F7C66A] bg-[#F7C66A] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#031B17] shadow-[0_0_15px_rgba(247,198,106,0.3)] transition-all hover:border-white hover:bg-white hover:text-[#031B17] sm:w-auto"
            >
              {t("accept")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
