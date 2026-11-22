import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LocalityMap from "@/components/projects/LocalityMap";
import { LocationPinIcon } from "@/components/projects/ProjectCards";
import { localizePath, SITE_URL } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { assetUrl, getCatalogIndex, getLocality, localityHref } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const { localities } = await getCatalogIndex();
  return localities.length ? localities.map((l) => ({ slug: l.slug })) : [{ slug: "aucune-localite" }];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/localite/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getT("projects");
  const locality = await getLocality(locale, slug);
  if (!locality) return pageMetadata({ locale, path: localityHref(slug), title: t("notFoundTitle"), noindex: true });
  const vars = { city: locality.name };
  return pageMetadata({
    locale,
    path: localityHref(locality.slug),
    title: t("localityMetaTitle", vars),
    description: t("localityMetaDescription", vars),
    keywords: t("localityKeywords", vars),
    image: locality.heroImage ? new URL(assetUrl(locality.heroImage), SITE_URL).toString() : undefined,
    appendSuffix: false,
    available: locality.locales,
    noindex: !locality.locales.includes(locale),
  });
}

export default function LocalityPage({ params }: PageProps<"/[locale]/localite/[slug]">) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#031B17] text-white">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute start-[-10%] top-[-20%] h-[900px] w-[900px] bg-[radial-gradient(circle,rgba(21,105,83,0.3),transparent_70%)]" />
        <div className="absolute end-[-10%] top-[40%] h-[700px] w-[700px] bg-[radial-gradient(circle,rgba(225,187,127,0.1),transparent_70%)]" />
      </div>
      <Header />
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <LocalityContent params={params} />
      </Suspense>
      <Footer />
    </div>
  );
}

async function LocalityContent({ params }: { params: PageProps<"/[locale]/localite/[slug]">["params"] }) {
  const { slug } = await params;
  const locale = await getLocale();
  const locality = await getLocality(locale, slug);
  if (!locality) notFound();
  const t = await getT("projects");
  const one = locality.projects.length === 1;
  const hero = assetUrl(locality.heroImage);
  const mobileHero = assetUrl(locality.mobileImage) || hero;

  return (
    <>
      <section className="relative mb-10 flex h-[70vh] w-full flex-col justify-end pb-12 md:h-screen md:min-h-[800px] md:flex-row md:items-center md:pb-0 md:pt-20">
        <div className="absolute inset-0 z-0">
          {hero && (
            <picture>
              <source media="(max-width: 767px)" srcSet={mobileHero} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero} alt="" fetchPriority="high" className="h-full w-full object-cover" />
            </picture>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#031B17] via-transparent to-transparent md:bg-gradient-to-r md:from-[#031B17]/90 md:via-[#031B17]/70 md:to-transparent md:rtl:bg-gradient-to-l" />
        </div>
        <div className="container relative z-10 mx-auto px-4 md:px-10">
          <div className="w-full md:w-1/2">
            <div className="relative mb-4">
              <span className="block -rotate-2 font-signature text-5xl text-[#F7C66A] md:text-8xl">{one ? t("signatureOne") : t("signatureMany")}</span>
              <span className="mt-2 block text-xl font-light uppercase tracking-widest text-white md:text-4xl">{one ? t("residentialOne") : t("residentialMany")}</span>
              <h1 className="mt-2 text-3xl font-bold uppercase leading-tight tracking-wide text-white md:text-6xl">{locality.name}</h1>
            </div>
            <p className="mt-8 hidden max-w-xl text-justify text-sm font-light leading-relaxed text-gray-200 md:block md:text-base" lang={locality.contentLocale}>
              {locality.description}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-4 py-8 md:hidden">
        <div className="mb-6 h-1 w-8 rounded-full bg-[#F7C66A] shadow-lg" />
        <p className="text-justify text-sm font-light leading-relaxed text-gray-200" lang={locality.contentLocale}>
          {locality.description}
        </p>
      </section>

      <section className="relative z-10 px-4 py-20 md:px-10">
        <div className="container mx-auto">
          {locality.projects.length > 0 ? (
            <LocalityMap projects={locality.projects} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
              <LocationPinIcon />
              <h2 className="mt-4 text-xl font-bold uppercase tracking-wider text-white">{t("noProjectsTitle")}</h2>
              <p className="mx-auto mt-2 max-w-md text-white/60">{t("noProjectsText", { city: locality.name })}</p>
              <Link
                href={localizePath(locale, "/projets")}
                className="mt-6 rounded-full bg-[#F7C66A] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#031B17] transition-colors hover:bg-white"
              >
                {t("allProjects")}
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
