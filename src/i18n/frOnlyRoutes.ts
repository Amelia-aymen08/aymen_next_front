// Routes servies uniquement en français, hors du système de langues :
// dashboards internes, scanners, pages événementielles.
// Elles vivent dans src/app/(fr-only)/ et le proxy ne les réécrit pas.
// ⚠️ Toute nouvelle page de ce groupe doit être ajoutée ici.
export const FR_ONLY_PREFIXES = [
  "/admin",
  "/batimat",
  "/batimat-admin",
  "/batimat-after",
  "/batimat-after-admin",
  "/jpo-helenite-admin",
  "/jpo-helenite-leads",
  "/jpo-nice-admin",
  "/jpo-nice-leads",
  "/jpo_nice",
  "/jpo_helenite",
  "/jpo-helenite",
  "/tracking-admin",
  "/tracking-flyer",
  "/tracking-batimat",
  "/portail-batimatech",
  "/concours-batitec",
  "/offres-ete-2026",
] as const;

export function isFrOnlyPath(pathname: string): boolean {
  return FR_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
