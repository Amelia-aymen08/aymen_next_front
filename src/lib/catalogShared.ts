// Catalogue (projets / localités) : types et utilitaires utilisables côté serveur ET client.
import type { Locale } from "@/i18n/config";
import { API_BASE_URL } from "./config";

export type ProjectStatus = "en_cours" | "livre" | "bientot";

export type PlanRoom = { name: string; area: string };
export type ProjectPlan = { type: string; area: string; rooms?: PlanRoom[] };

export type ProjectSummary = {
  id: number;
  slug: string;
  title: string;
  /** Localisation saisie en français (« Hydra, Alger »). */
  location: string;
  /** Commune dans la langue de la page (« حيدرة »). */
  cityLabel: string;
  /** Localisation dans la langue de la page (« Hydra, Algiers »). */
  locationLabel: string;
  status: ProjectStatus;
  progressPercent: number | null;
  cardImage: string | null;
  coverImage: string | null;
  isNightMode: boolean;
  lat: number | null;
  lng: number | null;
  mapLinkUrl: string | null;
  planTypes: string[];
  locality: { id: number; slug: string | null; name: string } | null;
  shortDescription: string;
  /** Langue réelle du texte : "fr" quand la traduction manque. */
  contentLocale: Locale;
  /** Langues où le projet a un texte propre (pour hreflang / sitemap). */
  locales: Locale[];
  updatedAt: string;
};

export type ProjectDetail = ProjectSummary & {
  description: string;
  typology: string;
  metaTitle: string;
  metaDescription: string;
  blocks: string;
  features: string[];
  plans: ProjectPlan[];
  gallery: string[];
  mapEmbedUrl: string | null;
  virtualTourUrl: string | null;
};

export type LocalityPublic = {
  id: number;
  slug: string;
  name: string;
  city: string;
  description: string;
  iconImage: string | null;
  heroImage: string | null;
  mobileImage: string | null;
  contentLocale: Locale;
  locales: Locale[];
  updatedAt: string;
};

export type LocalityWithProjects = LocalityPublic & { projects: ProjectSummary[] };

export const projectHref = (slug: string) => `/projet/${slug}`;
export const localityHref = (slug: string) => `/localite/${slug}`;

/** Adresse d'une image : chemins du site (/assets/...) tels quels, images envoyées au dashboard (/uploads/...) sur le backend. */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/uploads/")) return `${API_BASE_URL}${path}`;
  return path;
}

/** Même transformation que les adresses de pages : « Célestine » -> « celestine ». */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();

type Labels = Record<Locale, string>;

// ---------------------------------------------------------------- commodités

export type Amenity = { key: string; labels: Labels; icon?: string; aliases?: string[] };

/** Vocabulaire fixe des commodités (cases à cocher du dashboard). Le libellé français est stocké en base. */
export const AMENITIES: Amenity[] = [
  { key: "reception", labels: { fr: "Réception", en: "Reception", ar: "استقبال" }, icon: "/assets/comodites/reception.png" },
  { key: "climatisation", labels: { fr: "Climatisation centralisée", en: "Central air conditioning", ar: "تكييف مركزي" }, icon: "/assets/comodites/climatisation.png" },
  { key: "domotique", labels: { fr: "Domotique", en: "Home automation", ar: "منزل ذكي" }, icon: "/assets/comodites/domotique.png" },
  { key: "ascenseur", labels: { fr: "Ascenseur", en: "Lift", ar: "مصعد" }, icon: "/assets/comodites/ascenseur.png" },
  { key: "parking", labels: { fr: "Parking de stationnement", en: "Parking", ar: "موقف سيارات" }, icon: "/assets/comodites/Parking.png" },
  { key: "cuisine", labels: { fr: "Cuisine", en: "Fitted kitchen", ar: "مطبخ مجهّز" }, icon: "/assets/comodites/cuisine.png" },
  { key: "dressing", labels: { fr: "Dressing", en: "Walk-in closet", ar: "غرفة ملابس" }, icon: "/assets/comodites/dressing.png" },
  { key: "salle-eau", labels: { fr: "Salle d'eau", en: "Shower room", ar: "غرفة استحمام" }, icon: "/assets/comodites/salle d'eau.png" },
  { key: "fenetre", labels: { fr: "Fenêtre", en: "Windows", ar: "نوافذ" }, icon: "/assets/comodites/fenetre.png" },
  { key: "isolation", labels: { fr: "Isolation phonique", en: "Soundproofing", ar: "عزل صوتي" }, icon: "/assets/comodites/isolation phonique.png" },
  { key: "groupe", labels: { fr: "Groupe électrogène", en: "Backup generator", ar: "مولّد كهربائي" }, icon: "/assets/comodites/groupe electrogene.png" },
  { key: "bache", labels: { fr: "Bâche à eau", en: "Water tank", ar: "خزان مياه" }, icon: "/assets/comodites/bache a eau.png" },
  { key: "abattoir", labels: { fr: "Abattoir", en: "Eid sacrifice area", ar: "مذبح الأضاحي" }, icon: "/assets/comodites/abattoir.png" },
  { key: "aire-jeux", labels: { fr: "Aire de jeux", en: "Playground", ar: "مساحة ألعاب" }, icon: "/assets/comodites/aire de jeux.png" },
  { key: "salle-sport", labels: { fr: "Salle de sport", en: "Gym", ar: "قاعة رياضة" }, icon: "/assets/comodites/salle de sport.png" },
  { key: "piscine-commune", labels: { fr: "Piscine commune", en: "Shared pool", ar: "مسبح مشترك" } },
  { key: "piscine-privative", labels: { fr: "Piscine privative", en: "Private pool", ar: "مسبح خاص" }, icon: "/assets/comodites/piscine privative.png" },
  { key: "spa", labels: { fr: "Spa", en: "Spa", ar: "سبا" }, icon: "/assets/comodites/spa.png" },
  { key: "spa-hammam", labels: { fr: "Spa Hammam Sauna", en: "Spa, hammam & sauna", ar: "سبا، حمّام وساونا" }, icon: "/assets/comodites/spa.png" },
  { key: "creche", labels: { fr: "Crèche garderie", en: "Nursery", ar: "روضة أطفال" } },
  { key: "copropriete", labels: { fr: "Gestion copropriété", en: "Property management", ar: "تسيير الملكية المشتركة" } },
];

const AMENITY_BY_NORM = new Map(AMENITIES.map((a) => [norm(a.labels.fr), a]));

export function findAmenity(label: string): Amenity | undefined {
  return AMENITY_BY_NORM.get(norm(label));
}

/** Commodité telle qu'affichée sur le site ; un libellé libre (hors vocabulaire) reste en français. */
export function amenityView(label: string, locale: Locale): { label: string; icon?: string } {
  const a = findAmenity(label);
  return a ? { label: a.labels[locale], icon: a.icon } : { label };
}

// ---------------------------------------------------------------- plans

const PLAN_TYPES: Record<string, Labels> = {
  DUPLEX: { fr: "Duplex", en: "Duplex", ar: "دوبلكس" },
  TRIPLEX: { fr: "Triplex", en: "Triplex", ar: "تريبلكس" },
  STUDIO: { fr: "Studio", en: "Studio", ar: "ستوديو" },
  LOCAUX: { fr: "Locaux", en: "Commercial units", ar: "محلات تجارية" },
  "LOCAL COMMERCIAL": { fr: "Local commercial", en: "Commercial unit", ar: "محل تجاري" },
  "PISCINES PRIVATIVES": { fr: "Piscines privatives", en: "Private pools", ar: "مسابح خاصة" },
  "DUPLEX EN F5": { fr: "Duplex en F5", en: "F5 duplex", ar: "دوبلكس F5" },
  PENTHOUSE: { fr: "Penthouse", en: "Penthouse", ar: "بنتهاوس" },
};

export function planTypeLabel(type: string, locale: Locale): string {
  return PLAN_TYPES[norm(type)]?.[locale] ?? type;
}

const ROOMS: Record<string, Labels> = {
  SEJOUR: { fr: "Séjour", en: "Living room", ar: "صالون" },
  "SEJOUR CUISINE": { fr: "Séjour + Cuisine", en: "Living room + kitchen", ar: "صالون + مطبخ" },
  CUISINE: { fr: "Cuisine", en: "Kitchen", ar: "مطبخ" },
  "CHAMBRE MASTER": { fr: "Chambre master", en: "Master bedroom", ar: "غرفة النوم الرئيسية" },
  DRESSING: { fr: "Dressing", en: "Walk-in closet", ar: "غرفة ملابس" },
  SDB: { fr: "SDB", en: "Bathroom", ar: "حمّام" },
  "SDB WC": { fr: "SDB + WC", en: "Bathroom + WC", ar: "حمّام + مرحاض" },
  "SDB CHAMBRE MASTER": { fr: "SDB (chambre master)", en: "Master bathroom", ar: "حمّام الغرفة الرئيسية" },
  WC: { fr: "WC", en: "WC", ar: "مرحاض" },
  CIRCULATION: { fr: "Circulation", en: "Hallway", ar: "ممرّ" },
  TERRASSE: { fr: "Terrasse", en: "Terrace", ar: "شرفة واسعة" },
};

/** « Chambre 02 » -> « Bedroom 02 », « Balcon 01 » -> « Balcony 01 », sinon dictionnaire, sinon tel quel. */
export function roomLabel(name: string, locale: Locale): string {
  if (locale === "fr") return name;
  const numbered = name.match(/^(chambre|balcon)\s*(\d+)$/i);
  if (numbered) {
    const word = /chambre/i.test(numbered[1])
      ? { en: "Bedroom", ar: "غرفة نوم" }[locale]
      : { en: "Balcony", ar: "شرفة" }[locale];
    return `${word} ${numbered[2]}`;
  }
  return ROOMS[norm(name)]?.[locale] ?? name;
}

const AREA_WORDS: Record<Exclude<Locale, "fr">, { from: string; to: string; and: string; onRequest: string; unit: string }> = {
  en: { from: "from", to: "to", and: "and", onRequest: "On request", unit: "m²" },
  ar: { from: "من", to: "إلى", and: "و", onRequest: "عند الطلب", unit: "م²" },
};

/**
 * Surface saisie en français dans le dashboard, affichée dans la langue :
 * « de 77 m² à 118 m² », « 46 à 64 m² », « de 323 m² et 386 m² », « 202 m² », « Consultable ».
 * Une formulation non reconnue est affichée telle quelle.
 */
export function areaLabel(area: string, locale: Locale): string {
  const raw = (area || "").trim();
  if (locale === "fr" || !raw) return raw;
  const w = AREA_WORDS[locale];
  if (/consultable|sur demande/i.test(raw)) return w.onRequest;
  const n = "(\\d+(?:[.,]\\d+)?)";
  const num = (s: string) => (locale === "en" ? s.replace(",", ".") : s);
  let m = raw.match(new RegExp(`^(?:de\\s+)?${n}\\s*(?:m²)?\\s+à\\s+${n}\\s*m²$`, "i"));
  if (m) return `${w.from} ${num(m[1])} ${w.unit} ${w.to} ${num(m[2])} ${w.unit}`;
  m = raw.match(new RegExp(`^(?:de\\s+)?${n}\\s*(?:m²)?\\s+et\\s+${n}\\s*m²$`, "i"));
  if (m) return `${num(m[1])} ${w.unit} ${w.and} ${num(m[2])} ${w.unit}`;
  m = raw.match(new RegExp(`^${n}\\s*m²$`, "i"));
  if (m) return `${num(m[1])} ${w.unit}`;
  return raw;
}

/** Valeur numérique (la première) d'une surface, pour trier les typologies. */
export function areaNumber(area: string): number {
  const m = (area || "").match(/\d+/);
  return m ? Number(m[0]) : 0;
}

/** Ville seule : « Hydra, Alger » -> « Hydra ». */
export const cityOf = (location: string) => location.split(",")[0].trim();
