import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogSidebar from "@/components/blog/BlogSidebar";
import NewsletterBanner from "@/components/blog/NewsletterBanner";
import { getLocale, getT } from "@/i18n/server";
import { getBlogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getT("blog");
  return pageMetadata({
    locale,
    path: "/blog",
    title: t("metaTitle"),
    description: t("metaDescription"),
    appendSuffix: false,
  });
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getT("blog");
  const posts = await getBlogPosts(locale);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#031B17] text-white">
      <BlogBackdrop />
      <Header />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-8">
        <header className="mb-16 text-center">
          <span className="mb-2 block font-signature text-6xl text-[#F7C66A] md:text-8xl">{t("kicker")}</span>
          <h1 className="text-2xl font-bold uppercase tracking-widest text-white md:text-4xl">
            {t("heading1")}
            <br />
            {t("heading2")}
          </h1>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          <section id="blog-grid" className="w-full scroll-mt-28 lg:w-[70%]">
            <BlogGrid posts={posts} />
          </section>
          <div className="w-full lg:w-[30%]">
            <BlogSidebar posts={posts} onListPage />
          </div>
        </div>

        <NewsletterBanner />
      </main>

      <Footer />
    </div>
  );
}
