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

  const canonical = canonicalCatalogPath(pathname);
  if (canonical) {
    return NextResponse.redirect(new URL(`${canonical}${search}`, request.url), 308);
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

// Anciennes adresses des pages projet / localité (ancien site React, QR codes imprimés) :
//   /projet/célestine, /projet/CÉLESTINE, /projet/diar%20el%20amane, /localite/chéraga, /projet/7
// -> redirection permanente vers l'adresse unique : /projet/celestine, /localite/cheraga…
const CATALOG_PATH = /^(\/(?:en|ar))?\/(projet|localite)\/([^/]+)\/?$/;

// Ancien lien par numéro (= id de la résidence dans Odoo) -> slug.
const LEGACY_PROJECT_IDS: Record<string, string> = {
  "1": "cyanite", "2": "azurite", "3": "agate", "4": "ametrine", "5": "cornaline", "6": "seraphinite",
  "7": "celestine", "8": "larimar", "9": "selenite", "10": "diar-el-amane", "11": "pyrite", "12": "jais",
  "13": "les-cretes", "14": "turquoise", "17": "bois-des-cars", "18": "peridot", "19": "corail",
  "20": "opale", "21": "citrine", "22": "angelite", "23": "rubis", "24": "onyx", "25": "el-mordjane",
  "26": "aymen", "27": "coquelicot", "28": "perla", "29": "althea", "30": "beryl", "31": "helenite",
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function canonicalCatalogPath(pathname: string): string | null {
  const m = pathname.match(CATALOG_PATH);
  if (!m) return null;
  const [, prefix = "", kind, raw] = m;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // encodage invalide : on garde le texte brut
  }
  const slug = kind === "projet" && LEGACY_PROJECT_IDS[decoded] ? LEGACY_PROJECT_IDS[decoded] : slugify(decoded);
  const target = `${prefix}/${kind}/${slug}`;
  return slug && target !== pathname ? target : null;
}

export const config = {
  // Ignore les fichiers statiques (tout ce qui a une extension), _next et les routes API.
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
