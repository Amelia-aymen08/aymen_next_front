import type { MetadataRoute } from "next";
import { hreflang, localizePath, locales, SITE_URL, type Locale } from "@/i18n/config";
import { getBlogIndex } from "@/lib/blog";
import { getCatalogIndex } from "@/lib/catalog";

// Pages publiques déjà migrées vers Next.js (à compléter au fil du portage).
const STATIC_PAGES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/projets", priority: 0.9, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
];

function entry(path: string, available: readonly Locale[], extra: Partial<MetadataRoute.Sitemap[number]>): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const l of available) languages[hreflang[l]] = `${SITE_URL}${localizePath(l, path)}`;
  if (available.includes("fr")) languages["x-default"] = `${SITE_URL}${localizePath("fr", path)}`;
  // Une entrée par langue, chacune listant toutes ses variantes (recommandation Google).
  return available.map((l) => ({
    url: `${SITE_URL}${localizePath(l, path)}`,
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = STATIC_PAGES.flatMap((p) => entry(p.path, locales, { priority: p.priority, changeFrequency: p.changeFrequency }));
  const posts = (await getBlogIndex()).flatMap((p) =>
    entry(`/blog/${p.slug}`, p.locales, { lastModified: p.updatedAt, priority: 0.6, changeFrequency: "monthly" })
  );
  const catalog = await getCatalogIndex();
  const projects = catalog.projects.flatMap((p) =>
    entry(`/projet/${p.slug}`, p.locales, { lastModified: p.updatedAt, priority: 0.9, changeFrequency: "weekly" })
  );
  const localities = catalog.localities.flatMap((l) =>
    entry(`/localite/${l.slug}`, l.locales, { lastModified: l.updatedAt, priority: 0.7, changeFrequency: "monthly" })
  );
  return [...pages, ...projects, ...localities, ...posts];
}
