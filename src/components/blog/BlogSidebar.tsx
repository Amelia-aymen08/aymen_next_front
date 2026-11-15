"use client";

import { useRouter } from "next/navigation";
import { LocaleLink, useHref, useT } from "@/i18n/client";
import { BLOG_CATEGORIES, coverUrl, type BlogCard } from "@/lib/blogShared";

const itemClass =
  "group flex w-full items-center gap-3 rounded-lg border border-[#F7C66A]/50 px-6 py-3 text-start text-xs font-bold uppercase tracking-widest text-white transition-all hover:border-[#F7C66A] hover:bg-[#F7C66A] hover:text-[#031B17]";

export default function BlogSidebar({ posts, onListPage = false }: { posts: BlogCard[]; onListPage?: boolean }) {
  const t = useT("blog");
  const href = useHref();
  const router = useRouter();
  const present = new Set(posts.map((p) => p.category));
  const categories = BLOG_CATEGORIES.filter((c) => present.has(c));
  const recent = posts.slice(0, 3);

  // Sur la page liste : filtre sans recharger. Ailleurs : lien vers /blog?category=...
  const go = (category: string | null) => {
    const url = category ? `${href("/blog")}?category=${category}` : href("/blog");
    if (onListPage) {
      window.history.pushState(null, "", url);
      window.dispatchEvent(new Event("blog:category"));
      document.getElementById("blog-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push(url);
    }
  };

  return (
    <aside className="w-full space-y-8 md:sticky md:top-20">
      <nav aria-label={t("categoriesTitle")} className="rounded-2xl border border-white/10 bg-[#1F3A35]/80 p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-3">
          {[null, ...categories].map((cat) => (
            <button key={cat ?? "all"} type="button" onClick={() => go(cat)} className={itemClass}>
              <span className="text-[#F7C66A] transition-colors group-hover:text-[#031B17] rtl:-scale-x-100" aria-hidden>
                →
              </span>
              {cat ? t(`cat_${cat}` as Parameters<typeof t>[0]) : t("all")}
            </button>
          ))}
        </div>
      </nav>

      {recent.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1F3A35]/80 p-6 shadow-2xl backdrop-blur-md">
          <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#F7C66A]">{t("recent")}</h2>
          <div className="flex flex-col gap-6">
            {recent.map((article) => (
              <LocaleLink key={article.slug} href={`/blog/${article.slug}`} className="group block">
                <div className="mb-3 h-32 w-full overflow-hidden rounded-lg border border-white/5 bg-white/5 transition-colors group-hover:border-[#F7C66A]/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl(article.coverImage)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                  />
                </div>
                <p className="line-clamp-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#F7C66A]">
                  {article.title}
                </p>
              </LocaleLink>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
