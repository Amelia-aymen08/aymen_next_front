import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import AmenitiesList from "@/components/projects/AmenitiesList";
import FadeIn from "@/components/projects/FadeIn";
import PlansAndLocation from "@/components/projects/PlansAndLocation";
import ProjectGallery from "@/components/projects/ProjectGallery";
import QuoteForm from "@/components/projects/QuoteForm";
import { localizePath, SITE_URL, type Locale } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { amenityView, assetUrl, cityOf, getCatalogIndex, getProject, projectHref, type ProjectDetail } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

// Pages pré-rendues pour chaque projet publié ; un projet créé ensuite dans le dashboard
// est rendu à la première visite puis mis en cache.
export async function generateStaticParams() {
  const { projects } = await getCatalogIndex();
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: "aucun-projet" }];
}

const displayName = (title: string) => title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();

export async function generateMetadata({ params }: PageProps<"/[locale]/projet/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT("projects");
  const project = await getProject(locale, slug);
  if (!project) return pageMetadata({ locale, path: projectHref(slug), title: t("notFoundTitle"), noindex: true });
  const vars = { name: displayName(project.title), city: project.cityLabel };
  // Une langue sans description traduite n'est ni indexée ni annoncée en hreflang.
  const translated = project.locales.includes(locale);
  return pageMetadata({
    locale,
    path: projectHref(project.slug),
    title: project.metaTitle || t("projectMetaTitle", vars),
    description: project.metaDescription || t("projectMetaDescription", vars),
    keywords: t("projectKeywords", vars),
    image: project.coverImage ? new URL(assetUrl(project.coverImage), SITE_URL).toString() : undefined,
    appendSuffix: false,
    available: project.locales,
    noindex: !translated,
  });
}

export default function ProjectPage({ params }: PageProps<"/[locale]/projet/[slug]">) {
  return (
    <div className="relative min-h-screen bg-[#031B17] text-white">
      <BlogBackdrop />
      <div className="relative z-10">
        <Header />
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <ProjectContent params={params} />
        </Suspense>
        <Footer />
      </div>
    </div>
  );
}

async function ProjectContent({ params }: { params: PageProps<"/[locale]/projet/[slug]">["params"] }) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = await getProject(locale, slug);
  if (!project) notFound();
  const t = await getT("projects");
  const name = displayName(project.title);
  const city = project.cityLabel;
  const amenities = project.features.map((f) => amenityView(f, locale));
  const mapUrl =
    project.mapLinkUrl ||
    (project.lat && project.lng ? `https://www.google.com/maps/search/?api=1&query=${project.lat},${project.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`);
  const statusLabel = project.status === "livre" ? t("statusDone") : project.status === "bientot" ? t("statusSoon") : t("statusOngoing");

  return (
    <>
      <ProjectJsonLd project={project} locale={locale} name={name} />
      <FadeIn>
        <section className="w-full px-4 pb-20 pt-40 md:px-10 lg:px-20">
          <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-20">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <span className="text-2xl font-light text-white/90">{t("residence")}</span>
                <h1 className="origin-left -rotate-2 py-2 font-signature text-6xl leading-[1.2] text-[#F7C66A] rtl:origin-right md:text-8xl lg:leading-[1.1]" dir="ltr">
                  {name}
                </h1>
              </div>
              <div className="max-w-xl space-y-4 text-sm font-light leading-relaxed text-white/80 md:text-base" lang={project.contentLocale}>
                {project.description.split(/\n\s*\n/).map((para, i) => (
                  <p key={i}>{para.trim()}</p>
                ))}
              </div>
              {project.contentLocale !== locale && <p className="max-w-xl text-xs italic text-white/50">{t("frenchOnly")}</p>}
              <div className="space-y-6">
                <p className="text-sm font-bold uppercase tracking-widest text-[#F7C66A]">{statusLabel}</p>
                <div className="flex flex-wrap gap-4">
                  <StatBox label={t("address")} value={city} />
                  {project.typology && <StatBox label={t("typology")} value={project.typology} />}
                  {project.blocks && <StatBox label={t("blocks")} value={project.blocks} />}
                  {project.status === "bientot" ? (
                    <div className="min-w-[140px] rounded-xl border border-[#F7C66A]/40 bg-[#1a3a2a] px-6 py-4 shadow-lg">
                      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/70">{t("progressState")}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg text-[#F7C66A]" aria-hidden>
                          ✨
                        </span>
                        <span className="text-sm font-bold uppercase tracking-wide text-[#F7C66A]">{t("comingSoon")}</span>
                      </div>
                    </div>
                  ) : (
                    <StatBox label={t("progressState")} value={`${project.status === "livre" ? 100 : (project.progressPercent ?? 0)} %`} ltr />
                  )}
                </div>
              </div>
            </div>
            <div className="relative h-[400px] w-full flex-1 overflow-hidden rounded-3xl border border-white/10 shadow-2xl md:h-[500px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assetUrl(project.coverImage || project.cardImage)}
                alt={t("cardImageAlt", { name })}
                fetchPriority="high"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      </FadeIn>

      {amenities.length > 0 && (
        <FadeIn delay={200}>
          <AmenitiesList amenities={amenities} />
        </FadeIn>
      )}

      {project.gallery.length > 0 && (
        <FadeIn delay={300}>
          <ProjectGallery images={project.gallery} projectName={name} />
        </FadeIn>
      )}

      {project.virtualTourUrl && (
        <FadeIn delay={350}>
          <section className="px-4 py-16 md:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 text-center">
                <span className="mb-1 block font-signature text-4xl text-[#F7C66A]">{t("discoverScript")}</span>
                <h2 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">{t("virtualTour")}</h2>
              </div>
              <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={project.virtualTourUrl}
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
                  title={t("virtualTourTitle", { name })}
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      <FadeIn delay={400}>
        <PlansAndLocation plans={project.plans} mapEmbedUrl={project.mapEmbedUrl} mapUrl={mapUrl} place={project.locationLabel} />
      </FadeIn>

      <FadeIn delay={500}>
        <QuoteForm projectTitle={project.title} />
      </FadeIn>
    </>
  );
}

function StatBox({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="min-w-[140px] rounded-xl border border-white/5 bg-[#2C4A44] px-6 py-4 shadow-lg">
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-white/70">{label}</div>
      <div className="text-xl font-bold text-white" dir={ltr ? "ltr" : undefined}>
        {value}
      </div>
    </div>
  );
}

/** Données structurées : résidence (ApartmentComplex) + fil d'Ariane. */
async function ProjectJsonLd({ project, locale, name }: { project: ProjectDetail; locale: Locale; name: string }) {
  const t = await getT("projects");
  const url = `${SITE_URL}${localizePath(locale, projectHref(project.slug))}`;
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "ApartmentComplex",
      name: t("residenceName", { name }),
      url,
      description: project.shortDescription || undefined,
      image: [project.coverImage, ...project.gallery.slice(0, 5)].filter(Boolean).map((i) => new URL(assetUrl(i), SITE_URL).toString()),
      address: { "@type": "PostalAddress", addressLocality: cityOf(project.location), addressRegion: "Alger", addressCountry: "DZ" },
      ...(project.lat && project.lng ? { geo: { "@type": "GeoCoordinates", latitude: project.lat, longitude: project.lng } } : {}),
      ...(project.features.length
        ? { amenityFeature: project.features.map((f) => ({ "@type": "LocationFeatureSpecification", name: amenityView(f, locale).label, value: true })) }
        : {}),
      brand: { "@type": "Organization", name: "Aymen Promotion Immobilière", url: SITE_URL },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("breadcrumbHome"), item: `${SITE_URL}${localizePath(locale, "/")}` },
        { "@type": "ListItem", position: 2, name: t("breadcrumbProjects"), item: `${SITE_URL}${localizePath(locale, "/projets")}` },
        { "@type": "ListItem", position: 3, name: t("residenceName", { name }), item: url },
      ],
    },
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
