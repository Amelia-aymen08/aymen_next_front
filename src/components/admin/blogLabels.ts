export const CATEGORY_LABELS: Record<string, string> = {
  evenement: "Événement",
  "amenagement-decoration": "Aménagement et décoration",
  investissement: "Investissement",
  "achat-vente": "Achat et vente",
  "style-de-vie": "Style de vie",
  "gestion-copropriete": "Gestion de copropriété",
};

export const LOCALES = ["fr", "en", "ar"] as const;
export type AdminLocale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<AdminLocale, string> = { fr: "Français", en: "Anglais", ar: "Arabe" };

/** Une langue est complète si elle a un titre et un contenu (sinon elle n'est pas publiée dans cette langue). */
export function isComplete(t?: { title?: string; contentHtml?: string } | null): boolean {
  if (!t?.title?.trim()) return false;
  return !!(t.contentHtml || "").replace(/<[^>]+>/g, "").trim();
}
