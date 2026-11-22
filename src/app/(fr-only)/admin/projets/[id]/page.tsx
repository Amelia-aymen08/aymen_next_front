import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProjectEditor from "@/components/admin/ProjectEditor";

// /admin/projets/nouveau -> création ; /admin/projets/12 -> modification
async function Editor({ params }: { params: PageProps<"/admin/projets/[id]">["params"] }) {
  const { id } = await params;
  const numeric = Number(id);
  return <ProjectEditor key={id} id={id === "nouveau" || !Number.isInteger(numeric) ? null : numeric} />;
}

export default function AdminProjectPage({ params }: PageProps<"/admin/projets/[id]">) {
  return (
    <AdminShell>
      <Suspense fallback={<p className="py-10 text-center text-white/50">Chargement…</p>}>
        <Editor params={params} />
      </Suspense>
    </AdminShell>
  );
}
