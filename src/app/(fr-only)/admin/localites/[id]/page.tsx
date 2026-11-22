import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import LocalityEditor from "@/components/admin/LocalityEditor";

// /admin/localites/nouveau -> création ; /admin/localites/3 -> modification
async function Editor({ params }: { params: PageProps<"/admin/localites/[id]">["params"] }) {
  const { id } = await params;
  const numeric = Number(id);
  return <LocalityEditor key={id} id={id === "nouveau" || !Number.isInteger(numeric) ? null : numeric} />;
}

export default function AdminLocalityPage({ params }: PageProps<"/admin/localites/[id]">) {
  return (
    <AdminShell>
      <Suspense fallback={<p className="py-10 text-center text-white/50">Chargement…</p>}>
        <Editor params={params} />
      </Suspense>
    </AdminShell>
  );
}
