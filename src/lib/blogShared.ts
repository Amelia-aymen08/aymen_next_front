// Types et utilitaires du blog utilisables partout (serveur et navigateur).
import { API_BASE_URL } from "./config";
import type { Locale } from "@/i18n/config";

export const BLOG_CATEGORIES = [
  "evenement",
  "amenagement-decoration",
  "investissement",
  "achat-vente",
  "style-de-vie",
  "gestion-copropriete",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogCard = {
  slug: string;
  category: BlogCategory;
  coverImage: string | null;
  author: string | null;
  publishedAt: string | null;
  updatedAt: string;
  title: string;
  excerpt: string | null;
  locales: Locale[];
};

export type BlogPost = BlogCard & {
  contentHtml: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

/** Image de couverture : URL absolue, ou chemin /uploads servi par le backend, ou image par défaut. */
export function coverUrl(path: string | null | undefined): string {
  if (!path) return "/blog.jpg";
  if (/^https?:\/\//.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
