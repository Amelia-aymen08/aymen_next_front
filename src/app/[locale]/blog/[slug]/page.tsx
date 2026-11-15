import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogBackdrop from "@/components/blog/BlogBackdrop";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { LocaleLink } from "@/i18n/client";
import { SITE_URL, localizePath, type Locale } from "@/i18n/config";
import { getLocale, getT } from "@/i18n/server";
import { coverUrl, getBlogIndex, getBlogPost, getBlogPosts } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { embedYoutube } from "@/lib/articleHtml";
import { pageMetadata } from "@/lib/seo";

// Articles connus au build : prérendus. Les nouveaux : générés à la première visite puis mis en cache.
export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const index = await getBlogIndex();
  const slugs = index.filter((p) => p.locales.includes(params.locale as Locale)).map((p) => ({ slug: p.slug }));
  // Next exige au moins une valeur : sans article (ou backend injoignable), une page 404 est prérendue.
  return slugs.length ? slugs : [{ slug: "aucun-article" }];
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getBlogPost(locale, slug);
  if (!post) return { robots: { index: false, follow: true } };
  return pageMetadata({
    locale,
    path: `/blog/${post.slug}`,
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: coverUrl(post.coverImage).startsWith("http") ? coverUrl(post.coverImage) : `${SITE_URL}${coverUrl(post.coverImage)}`,
    type: "article",
    // hreflang : uniquement les langues dans lesquelles l'article existe vraiment.
    available: post.locales,
  });
}

async function Article({ params }: { params: PageProps<"/[locale]/blog/[slug]">["params"] }) {
  const { slug } = await params;
  const locale = await getLocale();
  const [post, posts, t] = await Promise.all([getBlogPost(locale, slug), getBlogPosts(locale), getT("blog")]);
  if (!post) notFound();

  const url = `${SITE_URL}${localizePath(locale, `/blog/${post.slug}`)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    image: coverUrl(post.coverImage).startsWith("http") ? coverUrl(post.coverImage) : `${SITE_URL}${coverUrl(post.coverImage)}`,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    inLanguage: locale,
    author: { "@type": "Organization", name: post.author || "Aymen Promotion" },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: url,
  };

  return (
    <div className="flex flex-col gap-12 lg:flex-row">
      <article className="w-full lg:w-3/4">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <LocaleLink href="/blog" className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 transition hover:text-[#F7C66A]">
          <span className="rtl:-scale-x-100" aria-hidden>←</span>
          {t("backToBlog")}
        </LocaleLink>

        <header className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-wider text-[#F7C66A]">
            {post.publishedAt && (
              <span className="flex items-center gap-2">
                <i className="fa-regular fa-calendar" aria-hidden />
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
              </span>
            )}
            {post.author && (
              <span className="flex items-center gap-2">
                <i className="fa-regular fa-user" aria-hidden />
                {post.author}
              </span>
            )}
          </div>
          <h1 className="mb-6 text-2xl font-bold uppercase leading-tight tracking-wide text-white md:text-3xl lg:text-4xl">{post.title}</h1>
          <span className="inline-block rounded-full border border-[#F7C66A] px-4 py-1 text-xs font-bold uppercase tracking-widest text-[#F7C66A]">
            {t(`cat_${post.category}` as Parameters<typeof t>[0])}
          </span>
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl(post.coverImage)} alt="" className="mb-8 w-full rounded-xl border border-white/10 object-cover shadow-lg" />
        )}

        {/* HTML nettoyé côté backend (sanitize-html) à l'enregistrement. */}
        <div className="article-body" dangerouslySetInnerHTML={{ __html: embedYoutube(post.contentHtml) }} />
      </article>

      <div className="w-full lg:w-1/4">
        <BlogSidebar posts={posts.filter((p) => p.slug !== post.slug)} />
      </div>
    </div>
  );
}

export default function BlogPostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#031B17] text-white">
      <BlogBackdrop />
      <Header />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-32 md:px-8">
        <Suspense
          fallback={
            <div className="flex justify-center py-32">
              <span className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#F7C66A] border-t-transparent" />
            </div>
          }
        >
          <Article params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
