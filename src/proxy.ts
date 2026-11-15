import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { isFrOnlyPath } from "@/i18n/frOnlyRoutes";

// Routage des langues.
// - /en/... et /ar/... : servis tels quels par app/[locale].
// - /fr/... : redirection permanente vers la version sans préfixe (une seule URL par page).
// - Routes « fr-only » (dashboards, événements) : servies telles quelles par app/(fr-only).
// - Tout le reste (/projets, /a-propos, ...) : réécrit en interne vers /fr/... ;
//   l'URL visible reste /projets.
// Aucune redirection selon la langue du navigateur : Googlebot doit pouvoir
// explorer chaque version (règle SEO multilingue).
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  // En production, le proxy est rappelé sur l'URL déjà réécrite (/blog -> /fr/blog) :
  // sans ce marqueur, la règle ci-dessous redirigerait /fr/blog vers /blog, en boucle.
  if (request.headers.get(INTERNAL_REWRITE_HEADER) === "1") {
    return NextResponse.next();
  }

  if (first === defaultLocale) {
    const rest = pathname.slice(defaultLocale.length + 1) || "/";
    return NextResponse.redirect(new URL(`${rest}${search}`, request.url), 308);
  }

  if (isLocale(first) || isFrOnlyPath(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  const headers = new Headers(request.headers);
  headers.set(INTERNAL_REWRITE_HEADER, "1");
  return NextResponse.rewrite(url, { request: { headers } });
}

const INTERNAL_REWRITE_HEADER = "x-aymen-locale-rewrite";

export const config = {
  // Ignore les fichiers statiques (tout ce qui a une extension), _next et les routes API.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
