"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch, previewUrl, type AdminProjectRow, type ProjectStatus } from "@/lib/adminApi";

const STATUS: Record<ProjectStatus, { label: string; cls: string }> = {
  en_cours: { label: "En cours", cls: "border-sky-400/50 text-sky-300" },
  bientot: { label: "Avant-première", cls: "border-violet-400/50 text-violet-300" },
  livre: { label: "Livré", cls: "border-white/25 text-white/60" },
};

type Filter = "all" | ProjectStatus | "hidden";

function LangBadges({ row }: { row: AdminProjectRow }) {
  return (
    <div className="flex gap-1">
      {(["fr", "en", "ar"] as const).map((l) => {
        const done = row.locales.includes(l);
        const machine = l !== "fr" && row.machineTranslated.includes(l);
        const cls = !done ? "border-white/15 text-white/30" : machine ? "border-amber-400/60 bg-amber-400/10 text-amber-300" : "border-emerald-400/60 bg-emerald-400/10 text-emerald-300";
        return (
          <span key={l} title={!done ? "Non traduit" : machine ? "Traduction automatique à relire" : "Prêt"} className={`rounded border px-1.5 py-0.5 text-[11px] font-bold uppercase ${cls}`}>
            {l}
          </span>
        );
      })}
    </div>
  );
}

/** Avancement modifiable directement dans la liste (enregistré à la validation). */
function ProgressCell({ row, onSaved }: { row: AdminProjectRow; onSaved: (patch: Partial<AdminProjectRow>) => void }) {
  const [value, setValue] = useState(row.progressPercent === null ? "" : String(row.progressPercent));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const changed = value !== (row.progressPercent === null ? "" : String(row.progressPercent));

  const save = async () => {
    if (!changed) return;
    setState("saving");
    try {
      const n = value === "" ? null : Math.min(100, Number(value));
      await adminFetch(`/projects/${row.id}`, { method: "PATCH", body: JSON.stringify({ progressPercent: n }) });
      onSaved({ progressPercent: n });
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  };

  if (row.status !== "en_cours") return <span className="text-white/40">{row.status === "livre" ? "100 %" : "—"}</span>;
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <div className="flex items-center rounded-md border border-white/15 bg-white/5 focus-within:border-[#F7C66A]">
        <input
          inputMode="numeric"
          aria-label={`Avancement de ${row.title} en %`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, "").slice(0, 3));
            setState("idle");
          }}
          onBlur={() => void save()}
          className="w-11 bg-transparent py-1 text-end font-semibold outline-none"
        />
        <span className="pe-2 text-xs text-white/50">%</span>
      </div>
      <span className="w-16 text-xs" role="status">
        {state === "saving" && <span className="text-white/50">…</span>}
        {state === "saved" && <span className="text-emerald-300">✓ en ligne</span>}
        {state === "error" && <span className="text-red-300">échec</span>}
        {state === "idle" && changed && <span className="text-amber-200">Entrée ↵</span>}
      </span>
    </form>
  );
}

function ProjectsList() {
  const [rows, setRows] = useState<AdminProjectRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    adminFetch<{ items: AdminProjectRow[] }>("/projects")
      .then((d) => setRows(d.items))
      .catch((e) => setError((e as Error).message));
  }, []);

  const patchRow = (id: number, patch: Partial<AdminProjectRow>) => setRows((all) => (all || []).map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const togglePublished = async (row: AdminProjectRow) => {
    try {
      await adminFetch(`/projects/${row.id}`, { method: "PATCH", body: JSON.stringify({ published: !row.published }) });
      patchRow(row.id, { published: !row.published });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows || []).filter((r) => {
      if (filter === "hidden" ? r.published : filter !== "all" && r.status !== filter) return false;
      if (q && !`${r.title} ${r.address || ""} ${r.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, filter, query]);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "en_cours", label: "En cours" },
    { key: "bientot", label: "Avant-première" },
    { key: "livre", label: "Livrés" },
    { key: "hidden", label: "Masqués" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Projets</h1>
          <p className="text-sm text-white/50">Modifiez l&apos;avancement directement ici : le site est mis à jour dès la validation.</p>
        </div>
        <Link href="/admin/projets/nouveau" className="rounded-lg bg-[#F7C66A] px-4 py-2 text-sm font-semibold text-[#031B17] hover:bg-white">
          + Nouveau projet
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-sm ${filter === f.key ? "border-[#F7C66A] text-[#F7C66A]" : "border-white/15 text-white/60 hover:text-white"}`}
          >
            {f.label}
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          aria-label="Rechercher un projet"
          className="ms-auto w-full rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-[#F7C66A] sm:w-56"
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-500/15 px-4 py-3 text-red-300">{error}</p>}
      {!rows && !error && <p className="py-10 text-center text-white/50">Chargement…</p>}

      {rows && (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-white/5 text-start text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-start">
                  Projet
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  Avancement
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  Langues
                </th>
                <th scope="col" className="px-4 py-3 text-start">
                  Visible
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className={`border-t border-white/5 ${r.published ? "" : "opacity-60"}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/projets/${r.id}`} className="flex items-center gap-3 hover:text-[#F7C66A]">
                      <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-white/5">
                        {r.cardImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={previewUrl(r.cardImage)} alt="" className="h-full w-full object-contain" />
                        )}
                      </span>
                      <span>
                        <span className="block font-semibold uppercase">{r.title}</span>
                        <span className="block text-xs text-white/50">{r.address || "—"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ProgressCell row={r} onSaved={(patch) => patchRow(r.id, patch)} />
                  </td>
                  <td className="px-4 py-3">
                    <LangBadges row={r} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void togglePublished(r)}
                      className={`rounded-md border px-2 py-1 text-xs ${r.published ? "border-emerald-400/50 text-emerald-300" : "border-white/20 text-white/50"}`}
                      title={r.published ? "Cliquer pour masquer du site" : "Cliquer pour afficher sur le site"}
                    >
                      {r.published ? "Visible" : "Masqué"}
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">
                    Aucun projet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminProjectsPage() {
  return (
    <AdminShell>
      <ProjectsList />
    </AdminShell>
  );
}
