import type { Metadata } from "next";
import { hreflang, localizePath, locales, SITE_URL, type Locale } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";

const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const OG_LOCALE: Record<Locale, string> = { fr: "fr_FR", en: "en_US", ar: "ar_DZ" };

/**
 * Liens hreflang + canonical d'une page.
 * Chaque langue pointe vers SA propre URL (jamais vers la version française),
 * et x-default pointe vers le français.
 * `available` : langues réellement traduites pour cette page (par défaut : toutes).
 */
export function alternatesFor(locale: Locale, path: string, available: readonly Locale[] = locales) {
  const languages: Record<string, string> = {};
  for (const l of available) languages[hreflang[l]] = `${SITE_URL}${localizePath(l, path)}`;
  if (available.includes("fr")) languages["x-default"] = `${SITE_URL}${localizePath("fr", path)}`;
  return {
    canonical: `${SITE_URL}${localizePath(locale, path)}`,
    languages,
  };
}

type PageMetaInput = {
  locale: Locale;
  /** Chemin sans préfixe de langue : "/projets", "/projet/althea" */
  path: string;
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string;
  /** false = titre utilisé tel quel, sans « | Aymen Promotion Immobilière » */
  appendSuffix?: boolean;
  available?: readonly Locale[];
  noindex?: boolean;
};

export async function pageMetadata(input: PageMetaInput): Promise<Metadata> {
  const { locale, path, image, type = "website", appendSuffix = true, available, noindex } = input;
  const m = (await loadMessages(locale)).meta;
  const title = input.title ? (appendSuffix ? `${input.title} | ${m.titleSuffix}` : input.title) : m.defaultTitle;
  const description = input.description || m.defaultDescription;
  const ogImage = image || DEFAULT_IMAGE;
  const alternates = alternatesFor(locale, path, available);

  return {
    title: { absolute: title },
    description,
    keywords: input.keywords || m.defaultKeywords,
    alternates,
    robots: noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      locale: OG_LOCALE[locale],
      alternateLocale: (available ?? locales).filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      url: alternates.canonical,
      siteName: m.siteName,
      title,
      description,
      images: [{ url: ogImage, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}
