"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LocaleLink, useLocale, useT } from "@/i18n/client";
import { coverUrl, type BlogCard } from "@/lib/blogShared";
import { dateBadge } from "@/lib/format";

const PAGE = 6;

/**
 * Grille des articles. Toutes les cartes sont dans le HTML (référencement) ;
 * le filtre par catégorie (?category=...) et « Voir plus » agissent côté navigateur.
 */
export default function BlogGrid({ posts }: { posts: BlogCard[] }) {
  const t = useT("blog");
  const locale = useLocale();
  const [category, setCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE);

  // Lit ?category= après le chargement (les anciens liens restent valides).
  useEffect(() => {
    const sync = () => {
      setCategory(new URLSearchParams(window.location.search).get("category"));
      setVisibleCount(PAGE);
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("blog:category", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("blog:category", sync);
    };
  }, []);

  const filtered = category ? posts.filter((p) => p.category === category) : posts;
  const visible = filtered.slice(0, visibleCount);

  if (!filtered.length) {
    return <p className="py-20 text-center text-white/60">{category ? t("emptyCategory") : t("empty")}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visible.map((post, idx) => {
          const badge = dateBadge(post.publishedAt, locale);
          return (
            <motion.article
              key={post.slug}
              className="group flex h-full flex-col overflow-hidden rounded-xl bg-[#2F453E] shadow-lg"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: (idx % PAGE) * 0.1 }}
            >
              <div className="relative aspect-[16/9] w-full p-4 pb-0">
                <div className="relative h-full w-full">
                  <div className="h-full w-full overflow-hidden rounded-xl">
                    <LocaleLink href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element -- images du backend, tailles libres */}
                      <img
                        src={coverUrl(post.coverImage)}
                        alt=""
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </LocaleLink>
                  </div>
                  {badge && (
                    <div className="absolute bottom-0 end-0 z-10 flex h-14 w-14 translate-y-1/2 flex-col items-center justify-center rounded-xl bg-white text-black shadow-lg ltr:-translate-x-4 rtl:translate-x-4">
                      <span className="mb-0.5 text-[10px] font-bold uppercase leading-none">{badge.month}</span>
                      <span className="text-xl font-bold leading-none">{badge.day}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-grow flex-col px-6 pb-6 pt-8">
                <h2 className="mb-4 line-clamp-2 text-xl font-bold leading-tight text-white">
                  <LocaleLink href={`/blog/${post.slug}`}>{post.title}</LocaleLink>
                </h2>
                <div className="mt-auto">
                  <LocaleLink
                    href={`/blog/${post.slug}`}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#F7C66A] transition-colors hover:text-white"
                  >
                    {t("readMore")}
                    <span className="sr-only"> : {post.title}</span>
                  </LocaleLink>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE)}
            className="rounded-md bg-[#F7C66A] px-8 py-3 text-sm font-bold uppercase tracking-wide text-[#031B17] shadow-lg transition-colors hover:bg-white"
          >
            {t("loadMore")}
          </button>
        </div>
      )}
    </>
  );
}
