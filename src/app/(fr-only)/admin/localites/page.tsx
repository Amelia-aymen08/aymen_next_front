"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, previewUrl, type AdminLocalityRow } from "@/lib/adminApi";

function LocalitiesList() {
  const [rows, setRows] = useState<AdminLocalityRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<{ items: AdminLocalityRow[] }>("/localities")
      .then((d) => setRows(d.items))
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Localités</h1>
          <p className="text-sm text-white/50">Pages /localite/… et onglet « Localités » de la page Projets.</p>
        </div>
        <Link href="/admin/localites/nouveau" className="rounded-lg bg-[#F7C66A] px-4 py-2 text-sm font-semibold text-[#031B17] hover:bg-white">
          + Nouvelle localité
        </Link>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{error}</p>}
      {!rows && !error && <p className="py-10 text-center text-white/50">Chargement…</p>}
      {rows && (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((l) => (
            <li key={l.id}>
              <Link
                href={`/admin/localites/${l.id}`}
                className={`flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#F7C66A]/60 ${l.published ? "" : "opacity-60"}`}
              >
                <span className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-white/5">
                  {l.iconImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl(l.iconImage)} alt="" className="h-full w-full object-contain p-1" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{l.name}</span>
                  <span className="block text-xs text-white/50">
                    {l.projects} projet{l.projects > 1 ? "s" : ""} · {l.published ? "visible" : "masquée"}
                  </span>
                  <span className="mt-1 flex gap-1">
                    {(["fr", "en", "ar"] as const).map((lang) => (
                      <span
                        key={lang}
                        className={`rounded border px-1.5 text-[10px] font-bold uppercase ${l.locales.includes(lang) ? "border-emerald-400/60 text-emerald-300" : "border-white/15 text-white/30"}`}
                      >
                        {lang}
                      </span>
                    ))}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdminLocalitiesPage() {
  return (
    <AdminShell>
      <LocalitiesList />
    </AdminShell>
  );
}
