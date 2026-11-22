// Choix du formulaire de devis (page projet).
// `value` est envoyé tel quel au backend puis à Odoo / HubSpot : il reste en français
// quelle que soit la langue du site ; seul le libellé affiché est traduit.
import type { Locale } from "@/i18n/config";

export type QuoteOption = { value: string; labels?: Partial<Record<Locale, string>> };

export const optionLabel = (o: QuoteOption, locale: Locale) => o.labels?.[locale] ?? o.value;

export const COUNTRIES: QuoteOption[] = [
  { value: "Algérie", labels: { en: "Algeria", ar: "الجزائر" } },
  { value: "France", labels: { en: "France", ar: "فرنسا" } },
  { value: "Canada", labels: { en: "Canada", ar: "كندا" } },
  { value: "Belgique", labels: { en: "Belgium", ar: "بلجيكا" } },
  { value: "Suisse", labels: { en: "Switzerland", ar: "سويسرا" } },
  { value: "Tunisie", labels: { en: "Tunisia", ar: "تونس" } },
  { value: "Maroc", labels: { en: "Morocco", ar: "المغرب" } },
  { value: "Espagne", labels: { en: "Spain", ar: "إسبانيا" } },
  { value: "Italie", labels: { en: "Italy", ar: "إيطاليا" } },
  { value: "Allemagne", labels: { en: "Germany", ar: "ألمانيا" } },
  { value: "États-Unis", labels: { en: "United States", ar: "الولايات المتحدة" } },
  { value: "Royaume-Uni", labels: { en: "United Kingdom", ar: "المملكة المتحدة" } },
  { value: "Turquie", labels: { en: "Turkey", ar: "تركيا" } },
  { value: "Émirats Arabes Unis", labels: { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة" } },
  { value: "Qatar", labels: { en: "Qatar", ar: "قطر" } },
  { value: "Autre", labels: { en: "Other", ar: "أخرى" } },
];

export const WILAYAS: string[] = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès",
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma",
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane", "49 - El M'Ghair", "50 - El Meniaa",
  "51 - Ouled Djellal", "52 - Bordj Baji Mokhtar", "53 - Béni Abbès", "54 - Timimoun",
  "55 - Touggourt", "56 - Djanet", "57 - In Salah", "58 - In Guezzam",
];

export const BUDGETS: QuoteOption[] = [
  { value: "< 20M DA", labels: { en: "< DZD 20M", ar: "أقل من 20 مليون دج" } },
  { value: "20M DA - 40M DA", labels: { en: "DZD 20M – 40M", ar: "من 20 إلى 40 مليون دج" } },
  { value: "> 40M DA", labels: { en: "> DZD 40M", ar: "أكثر من 40 مليون دج" } },
];

export const PROFESSIONS: QuoteOption[] = [
  { value: "Salarié", labels: { en: "Employee", ar: "موظّف" } },
  { value: "Profession Libérale", labels: { en: "Self-employed professional", ar: "مهنة حرّة" } },
  { value: "Commerçant", labels: { en: "Business owner", ar: "تاجر" } },
  { value: "Autre", labels: { en: "Other", ar: "أخرى" } },
];

export const FINANCING: QuoteOption[] = [
  { value: "Fonds Propres", labels: { en: "Own funds", ar: "أموال خاصة" } },
  { value: "Crédit Bancaire", labels: { en: "Bank loan", ar: "قرض بنكي" } },
  { value: "Mixte", labels: { en: "Mixed", ar: "مختلط" } },
];

export const INTERESTS: QuoteOption[] = [
  { value: "Appartement", labels: { en: "Apartment", ar: "شقة" } },
  { value: "Duplex", labels: { en: "Duplex", ar: "دوبلكس" } },
  { value: "Local Commercial", labels: { en: "Commercial unit", ar: "محل تجاري" } },
  { value: "Bureau", labels: { en: "Office", ar: "مكتب" } },
];

export const LOCATIONS: QuoteOption[] = [
  { value: "Hydra", labels: { ar: "حيدرة" } },
  { value: "Dely Ibrahim", labels: { ar: "دالي إبراهيم" } },
  { value: "Draria", labels: { ar: "الدرارية" } },
  { value: "Ruisseau", labels: { ar: "الرويسو" } },
  { value: "Birkhadem", labels: { ar: "بئر خادم" } },
  { value: "Bad Ezzouar", labels: { en: "Bab Ezzouar", ar: "باب الزوار" } },
  { value: "El Achour", labels: { ar: "العاشور" } },
  { value: "Kouba", labels: { ar: "القبة" } },
  { value: "Dar el Beida", labels: { ar: "الدار البيضاء" } },
  { value: "Chéraga", labels: { ar: "الشراقة" } },
  { value: "Said Hamdine", labels: { ar: "سعيد حمدين" } },
];

export const DAYS: QuoteOption[] = [
  { value: "Samedi", labels: { en: "Saturday", ar: "السبت" } },
  { value: "Dimanche", labels: { en: "Sunday", ar: "الأحد" } },
  { value: "Lundi", labels: { en: "Monday", ar: "الاثنين" } },
  { value: "Mardi", labels: { en: "Tuesday", ar: "الثلاثاء" } },
  { value: "Mercredi", labels: { en: "Wednesday", ar: "الأربعاء" } },
  { value: "Jeudi", labels: { en: "Thursday", ar: "الخميس" } },
];

export const CONTACT_TIMES: QuoteOption[] = [
  { value: "Matin (9h-12h)", labels: { en: "Morning (9am–12pm)", ar: "صباحًا (9:00–12:00)" } },
  { value: "Après-midi (13h-17h)", labels: { en: "Afternoon (1pm–5pm)", ar: "بعد الظهر (13:00–17:00)" } },
  { value: "Soir (17h-20h)", labels: { en: "Evening (5pm–8pm)", ar: "مساءً (17:00–20:00)" } },
];

export const PROJECT_STATUSES: QuoteOption[] = [
  { value: "Urgent", labels: { en: "Urgent", ar: "عاجل" } },
  { value: "Moyen terme", labels: { en: "Medium term", ar: "على المدى المتوسط" } },
  { value: "Long terme", labels: { en: "Long term", ar: "على المدى البعيد" } },
];
