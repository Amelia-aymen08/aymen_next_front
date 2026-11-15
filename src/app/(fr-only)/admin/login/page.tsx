"use client";

import { useState, type FormEvent } from "react";
import { adminFetch, setToken, type AdminUser } from "@/lib/adminApi";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-[#F7C66A] focus:ring-1 focus:ring-[#F7C66A]";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await adminFetch<{ token: string; user: AdminUser }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(token, remember);
      const next = new URLSearchParams(window.location.search).get("next");
      window.location.href = next && next.startsWith("/admin") ? next : "/admin/blog";
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-[#0B2A24] p-8 shadow-2xl">
        <div className="space-y-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_original.svg" alt="Aymen Promotion" className="mx-auto h-12 w-auto" />
          <h1 className="text-lg font-semibold">Back-office</h1>
          <p className="text-sm text-white/60">Connectez-vous pour gérer le blog.</p>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm text-white/80">E-mail</span>
          <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-white/80">Mot de passe</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#F7C66A]" />
          Rester connecté sur cet appareil
        </label>

        {error && (
          <p role="alert" className="rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#F7C66A] py-3 font-semibold text-[#031B17] transition hover:bg-white disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
