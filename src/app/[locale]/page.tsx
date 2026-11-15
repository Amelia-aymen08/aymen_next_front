import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getLocale } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

// ⚠️ Page d'accueil provisoire : sert à valider la fondation (langues, RTL, header, footer).
// Elle sera remplacée par le portage de frontend/src/pages/HomePage.tsx.
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ locale: await getLocale(), path: "/" });
}

export default async function HomePage() {
  const locale = await getLocale();
  return (
    <>
      <div className="ambient-bg" aria-hidden />
      <Header />
      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-32">
        <p className="text-white/60">Accueil en cours de migration — {locale.toUpperCase()}</p>
      </main>
      <Footer />
    </>
  );
}
