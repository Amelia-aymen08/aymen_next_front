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

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const { url } = await adminFetch<{ url: string }>("/uploads", { method: "POST", body: form });
  return url;
}
