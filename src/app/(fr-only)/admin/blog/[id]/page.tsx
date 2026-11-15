import { Suspense } from "react";
import AdminShell from "@/components/admin/AdminShell";
import PostEditor from "@/components/admin/PostEditor";

// /admin/blog/nouveau -> création ; /admin/blog/12 -> modification
async function Editor({ params }: { params: PageProps<"/admin/blog/[id]">["params"] }) {
  const { id } = await params;
  const numeric = Number(id);
  return <PostEditor key={id} id={id === "nouveau" || !Number.isInteger(numeric) ? null : numeric} />;
}

export default function AdminPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  return (
    <AdminShell>
      <Suspense fallback={<p className="py-10 text-center text-white/50">Chargement…</p>}>
        <Editor params={params} />
      </Suspense>
    </AdminShell>
  );
}
