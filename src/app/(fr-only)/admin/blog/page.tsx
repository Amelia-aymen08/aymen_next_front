"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { CATEGORY_LABELS, LOCALES, isComplete } from "@/components/admin/blogLabels";
import { adminFetch, backendUrl, type AdminPost } from "@/lib/adminApi";

type Filter = "all" | "published" | "draft" | "missing";

function LangBadges({ post }: { post: AdminPost }) {
  return (
    <div className="flex gap-1">
      {LOCALES.map((l) => {
        const t = post.translations[l];
        const done = isComplete(t);
        const machine = done && t?.machineTranslated;
        const cls = !done
          ? "border-white/15 text-white/30"
          : machine
            ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
            : "border-emerald-400/60 bg-emerald-400/10 text-emerald-300";
        const title = !done ? "Non traduit" : machine ? "Traduction automatique à relire" : "Prêt";
        return (
          <span key={l} title={`${l.toUpperCase()} : ${title}`} className={`rounded border px-1.5 py-0.5 text-[11px] font-bold uppercase ${cls}`}>
            {l}
          </span>
        );
      })}
    </div>
  );
}

function BlogList() {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminFetch<{ items: AdminPost[] }>("/blog")
      .then((d) => setPosts(d.items))
      .catch((e) => setError((e as Error).message));
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts || []).filter((p) => {
      if (filter === "published" && p.status !== "published") return false;
      if (filter === "draft" && p.status !== "draft") return false;
      if (filter === "missing" && LOCALES.every((l) => isComplete(p.translations[l]))) return false;
      if (q && !`${p.translations.fr?.title || ""} ${p.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, filter, query]);

  const counts = useMemo(() => {
    const all = posts || [];
    return {
      all: all.length,
      published: all.filter((p) => p.status === "published").length,
      draft: all.filter((p) => p.status === "draft").length,
      missing: all.filter((p) => !LOCALES.every((l) => isComplete(p.translations[l]))).length,
    };
  }, [posts]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Articles du blog</h1>
          <p className="mt-1 text-sm text-white/60">
            Une langue n&apos;apparaît sur le site que si elle a un titre et un contenu.
          </p>
        </div>
        <Link href="/admin/blog/nouveau" className="rounded-lg bg-[#F7C66A] px-5 py-2.5 font-semibold text-[#031B17] transition hover:bg-white">
          + Nouvel article
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "Tous"],
            ["published", "Publiés"],
            ["draft", "Brouillons"],
            ["missing", "Traductions manquantes"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              filter === key ? "border-[#F7C66A] bg-[#F7C66A]/15 text-[#F7C66A]" : "border-white/15 text-white/70 hover:bg-white/5"
            }`}
          >
            {label} <span className="text-white/40">{counts[key]}</span>
          </button>
        ))}
        <input
          type="search"
          placeholder="Rechercher un titre…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ms-auto w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[#F7C66A] sm:w-64"
        />
      </div>

      {error && <p className="rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{error}</p>}
      {!posts && !error && <p className="py-10 text-center text-white/50">Chargement…</p>}
      {posts && visible.length === 0 && <p className="py-10 text-center text-white/50">Aucun article.</p>}

      <ul className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center gap-4 px-4 py-3 transition hover:bg-white/[0.04]">
            <div className="hidden h-14 w-24 shrink-0 overflow-hidden rounded-md bg-white/5 sm:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.coverImage ? backendUrl(p.coverImage) : "/blog.jpg"} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/blog/${p.id}`} className="line-clamp-1 font-medium hover:text-[#F7C66A]">
                {p.translations.fr?.title || p.slug}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                <span className={p.status === "published" ? "text-emerald-300" : "text-white/60"}>
                  {p.status === "published" ? "● Publié" : "○ Brouillon"}
                </span>
                <span>{CATEGORY_LABELS[p.category] || p.category}</span>
                {p.publishedAt && <span>{new Date(p.publishedAt).toLocaleDateString("fr-FR")}</span>}
                {!p.coverImage && <span className="text-amber-300/80">Sans image</span>}
              </div>
            </div>
            <LangBadges post={p} />
            <Link href={`/admin/blog/${p.id}`} className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
              Modifier
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminShell>
      <BlogList />
    </AdminShell>
  );
}
