// Configuration des langues du site.
// - Le français est servi à la racine, sans préfixe : /projets
// - L'anglais et l'arabe sous /en et /ar : /en/projets, /ar/projets
// Les chemins sont identiques dans les trois langues (choix validé).

export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const SITE_URL = "https://aymenpromotion-dz.com";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Préfixe un chemin interne avec la langue : ("en", "/projets") -> "/en/projets". */
export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Retire le préfixe de langue d'un chemin : "/en/projets" -> "/projets". */
export function stripLocale(pathname: string): string {
  const seg = pathname.split("/")[1];
  if (isLocale(seg) && seg !== defaultLocale) {
    const rest = pathname.slice(seg.length + 1);
    return rest === "" ? "/" : rest;
  }
  return pathname || "/";
}

export const localeLabels: Record<Locale, { short: string; name: string }> = {
  fr: { short: "FR", name: "Français" },
  en: { short: "EN", name: "English" },
  ar: { short: "ع", name: "العربية" },
};

// Balises hreflang : on cible la langue, pas un pays.
export const hreflang: Record<Locale, string> = { fr: "fr", en: "en", ar: "ar" };
