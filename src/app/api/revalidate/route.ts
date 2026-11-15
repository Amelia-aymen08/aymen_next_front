import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

// Appelé par le backend quand un article est créé / modifié / supprimé dans le dashboard.
// En-tête x-revalidate-secret = REVALIDATE_SECRET (même valeur que NEXT_REVALIDATE_SECRET côté backend).
function sameSecret(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") || "";
  if (!secret || !sameSecret(given, secret)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { tags?: unknown };
  const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 20) : [];
  // expire: 0 -> la prochaine visite affiche immédiatement la nouvelle version (pas de contenu périmé).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, revalidated: tags });
}
