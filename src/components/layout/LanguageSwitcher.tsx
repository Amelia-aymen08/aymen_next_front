"use client";

import { usePathname } from "next/navigation";
import { localeLabels, localizePath, locales, stripLocale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/client";

/**
 * Sélecteur FR · EN · ع : renvoie vers la MÊME page dans l'autre langue.
 * Lien <a> classique (rechargement complet) : la langue change <html lang dir>.
 */
export default function LanguageSwitcher({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const locale = useLocale();
  const t = useT("header");
  const pathname = usePathname() || "/";
  const base = stripLocale(pathname);

  return (
    <nav aria-label={t("language")} className={`flex items-center gap-1 ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1 text-white/30" aria-hidden>·</span>}
          {l === locale ? (
            <span aria-current="true" className="px-1 text-sm font-semibold text-[#F7C66A]" lang={l}>
              {localeLabels[l].short}
            </span>
          ) : (
            <a
              href={localizePath(l, base)}
              hrefLang={l}
              lang={l}
              onClick={onNavigate}
              title={localeLabels[l].name}
              className="px-1 text-sm font-medium text-white/70 transition hover:text-white"
            >
              {localeLabels[l].short}
            </a>
          )}
        </span>
      ))}
    </nav>
  );
}
