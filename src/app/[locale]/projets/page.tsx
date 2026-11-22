import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import ProjectsExplorer, { ProjectsExplorerFromUrl } from "@/components/projects/ProjectsExplorer";
import { getLocale, getT } from "@/i18n/server";
import { getLocalities, getProjects } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT("projects");
  return pageMetadata({
    locale,
    path: "/projets",
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: t("metaKeywords"),
    appendSuffix: false,
  });
}

export default async function ProjectsPage() {
  const locale = await getLocale();
  const [projects, localities] = await Promise.all([getProjects(locale), getLocalities(locale)]);

  return (
    <div className="relative min-h-screen bg-[#031B17] text-white">
      <BlogBackdrop />
      <Header />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-10">
        {/* Le HTML servi contient l'onglet « En cours » ; l'onglet demandé (?tab=) est appliqué dans le navigateur. */}
        <Suspense fallback={<ProjectsExplorer projects={projects} localities={localities} />}>
          <ProjectsExplorerFromUrl projects={projects} localities={localities} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
