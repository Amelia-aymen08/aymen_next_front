import { cacheLife, cacheTag } from "next/cache";
import { SERVER_API_URL } from "./config";
import type { Locale } from "@/i18n/config";
import type { BlogCard, BlogPost } from "./blogShared";

export * from "./blogShared";

type Result<T> = { ok: true; data: T } | { ok: false };

// notFoundIsEmpty : un 404 signifie « article inexistant » (résultat valide, mis en cache).
// Pour les listes, un 404 veut dire que l'API blog n'est pas (encore) déployée : erreur.
async function getJson<T>(path: string, notFoundIsEmpty = false): Promise<Result<T>> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { headers: { Accept: "application/json" } });
    if (res.status === 404 && notFoundIsEmpty) return { ok: true, data: null as T };
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    // Backend injoignable (build hors ligne...) : la page s'affiche vide plutôt que de planter.
    console.error(`[blog] ${path}:`, (err as Error).message);
    return { ok: false };
  }
}

// Données mises en cache quelques heures ; vidées immédiatement quand le dashboard publie
// (route /api/revalidate). Une erreur du backend n'est gardée que quelques minutes.

export async function getBlogPosts(locale: Locale): Promise<BlogCard[]> {
  "use cache";
  cacheTag("blog");
  const r = await getJson<{ items: BlogCard[] }>(`/api/blog?lang=${locale}&limit=200`);
  if (r.ok) cacheLife("hours");
  else cacheLife("minutes");
  return r.ok ? (r.data?.items ?? []) : [];
}

export async function getBlogPost(locale: Locale, slug: string): Promise<BlogPost | null> {
  "use cache";
  cacheTag("blog", `blog:${slug}`);
  const r = await getJson<BlogPost | null>(`/api/blog/${encodeURIComponent(slug)}?lang=${locale}`, true);
  if (r.ok) cacheLife("hours");
  else cacheLife("minutes");
  return r.ok ? r.data : null;
}

export async function getBlogIndex(): Promise<{ slug: string; updatedAt: string; locales: Locale[] }[]> {
  "use cache";
  cacheTag("blog");
  const r = await getJson<{ slug: string; updatedAt: string; locales: Locale[] }[]>("/api/blog-index");
  if (r.ok) cacheLife("hours");
  else cacheLife("minutes");
  return r.ok ? (r.data ?? []) : [];
}
