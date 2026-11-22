"use client";

import { API_BASE_URL } from "./config";

// Client du back-office (/api/admin/*). Jeton JWT gardé dans le navigateur (sessionStorage par défaut,
// localStorage si « rester connecté »).
const KEY = "aymen_admin_token";

export type AdminUser = { id: number; email: string; name: string | null; role: "admin" | "editor" };

export type TranslationFields = {
  title: string;
  excerpt: string;
  contentHtml: string;
  metaTitle: string;
  metaDescription: string;
  machineTranslated?: boolean;
};

export type AdminPost = {
  id: number;
  slug: string;
  status: "draft" | "published";
  category: string;
  coverImage: string | null;
  author: string | null;
  publishedAt: string | null;
  legacySource: string | null;
  createdAt: string;
  updatedAt: string;
  translations: Partial<Record<"fr" | "en" | "ar", TranslationFields & { updatedAt?: string }>>;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return window.sessionStorage.getItem(KEY) || window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null, remember = false) {
  try {
    window.sessionStorage.removeItem(KEY);
    window.localStorage.removeItem(KEY);
    if (token) (remember ? window.localStorage : window.sessionStorage).setItem(KEY, token);
  } catch {
    // stockage indisponible : la session ne survivra pas au rechargement
  }
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = init.body instanceof FormData;
  const res = await fetch(`${API_BASE_URL}/api/admin${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== "/login") {
    setToken(null);
    if (!window.location.pathname.startsWith("/admin/login")) {
      window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }
  if (!res.ok) throw new ApiError((data as { message?: string }).message || `Erreur ${res.status}`, res.status);
  return data as T;
}

export function backendUrl(path: string | null | undefined): string {
  if (!path) return "";
  return /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
}

/** Envoie une image au backend ; retourne son chemin (/uploads/<dossier>/...). */
export async function uploadImage(file: File, folder: "blog" | "projects" | "localities" = "blog"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { url } = await adminFetch<{ url: string }>(`/uploads?folder=${folder}`, { method: "POST", body: form });
  return url;
}

/** Aperçu d'une image dans le dashboard : /uploads/... sur le backend, /assets/... sur le site. */
export function previewUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith("/uploads/") ? `${API_BASE_URL}${path}` : path;
}

// ---------------------------------------------------------------- catalogue

export type ProjectStatus = "en_cours" | "livre" | "bientot";
export type AdminPlan = { type: string; area: string; rooms?: { name: string; area: string }[] };
export type ProjectTexts = { shortDescription: string; description: string; typology: string; metaTitle: string; metaDescription: string; machineTranslated?: boolean };

export type AdminProject = {
  id: number;
  slug: string;
  title: string;
  status: ProjectStatus;
  address: string;
  localityId: number | null;
  latitude: number | null;
  longitude: number | null;
  progressPercent: number | null;
  cardImage: string;
  coverImage: string;
  isNightMode: boolean;
  published: boolean;
  sortOrder: number;
  blocks: string;
  typology: string;
  features: string[];
  plans: AdminPlan[];
  gallery: string[];
  mapEmbedUrl: string;
  mapLinkUrl: string;
  virtualTourUrl: string;
  odooResidenceId: number | null;
  shortDescription: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  translations: Partial<Record<"en" | "ar", ProjectTexts & { updatedAt?: string }>>;
  updatedAt?: string;
};

export type AdminProjectRow = {
  id: number;
  slug: string;
  title: string;
  status: ProjectStatus;
  address: string | null;
  progressPercent: number | null;
  cardImage: string | null;
  published: boolean;
  sortOrder: number;
  odooResidenceId: number | null;
  locality: string | null;
  locales: ("fr" | "en" | "ar")[];
  machineTranslated: ("en" | "ar")[];
  updatedAt: string;
};

export type LocalityTexts = { name: string; description: string; machineTranslated?: boolean };

export type AdminLocality = {
  id: number;
  slug: string;
  name: string;
  city: string;
  description: string;
  imageUrl: string;
  iconImage: string;
  mobileImageUrl: string;
  published: boolean;
  sortOrder: number;
  translations: Partial<Record<"en" | "ar", LocalityTexts & { updatedAt?: string }>>;
  updatedAt?: string;
};

export type AdminLocalityRow = {
  id: number;
  slug: string | null;
  name: string;
  city: string;
  iconImage: string | null;
  published: boolean;
  sortOrder: number;
  projects: number;
  locales: ("fr" | "en" | "ar")[];
  updatedAt: string;
};
