import type { Locale } from "@/i18n/config";

// Formats régionaux : l'arabe d'Algérie utilise les chiffres occidentaux (1, 2, 3).
export const INTL_LOCALE: Record<Locale, string> = { fr: "fr-FR", en: "en-GB", ar: "ar-DZ" };

export function formatDate(value: string | null | undefined, locale: Locale, opts?: Intl.DateTimeFormatOptions): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(INTL_LOCALE[locale], opts ?? { day: "2-digit", month: "long", year: "numeric" });
}

export function dateBadge(value: string | null | undefined, locale: Locale): { month: string; day: string } | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    month: d.toLocaleDateString(INTL_LOCALE[locale], { month: "short" }).replace(".", ""),
    day: String(d.getDate()).padStart(2, "0"),
  };
}
