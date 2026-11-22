import { cacheLife, cacheTag } from "next/cache";
import { SERVER_API_URL } from "./config";
import type { Locale } from "@/i18n/config";
import type { LocalityPublic, LocalityWithProjects, ProjectDetail, ProjectSummary } from "./catalogShared";

export * from "./catalogShared";

// Lecture du catalogue (projets / localités) depuis le backend, côté serveur uniquement.
// Mis en cache quelques heures, vidé immédiatement quand le dashboard enregistre
// (tags « projects », « project:<slug> », « localities » via /api/revalidate).
// Une erreur du backend n'est gardée que quelques minutes.

type Result<T> = { ok: true; data: T } | { ok: false };

async function getJson<T>(path: string, notFoundIsEmpty = false): Promise<Result<T>> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, { headers: { Accept: "application/json" } });
    if (res.status === 404 && notFoundIsEmpty) return { ok: true, data: null as T };
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch (err) {
    console.error(`[catalogue] ${path}:`, (err as Error).message);
    return { ok: false };
  }
}

function life(ok: boolean) {
  if (ok) cacheLife("hours");
  else cacheLife("minutes");
}

export async function getProjects(locale: Locale): Promise<ProjectSummary[]> {
  "use cache";
  cacheTag("projects");
  const r = await getJson<{ items: ProjectSummary[] }>(`/api/site/projects?lang=${locale}`);
  life(r.ok);
  return r.ok ? (r.data?.items ?? []) : [];
}

export async function getProject(locale: Locale, slug: string): Promise<ProjectDetail | null> {
  "use cache";
  cacheTag("projects", `project:${slug}`);
  const r = await getJson<ProjectDetail | null>(`/api/site/projects/${encodeURIComponent(slug)}?lang=${locale}`, true);
  life(r.ok);
  return r.ok ? r.data : null;
}

export async function getLocalities(locale: Locale): Promise<LocalityPublic[]> {
  "use cache";
  cacheTag("localities");
  const r = await getJson<{ items: LocalityPublic[] }>(`/api/site/localities?lang=${locale}`);
  life(r.ok);
  return r.ok ? (r.data?.items ?? []) : [];
}

export async function getLocality(locale: Locale, slug: string): Promise<LocalityWithProjects | null> {
  "use cache";
  cacheTag("localities", "projects");
  const r = await getJson<LocalityWithProjects | null>(`/api/site/localities/${encodeURIComponent(slug)}?lang=${locale}`, true);
  life(r.ok);
  return r.ok ? r.data : null;
}

export type CatalogIndex = {
  projects: { slug: string; updatedAt: string; locales: Locale[] }[];
  localities: { slug: string; updatedAt: string; locales: Locale[] }[];
};

export async function getCatalogIndex(): Promise<CatalogIndex> {
  "use cache";
  cacheTag("projects", "localities");
  const r = await getJson<CatalogIndex>("/api/site/catalog-index");
  life(r.ok);
  return r.ok ? r.data : { projects: [], localities: [] };
}
