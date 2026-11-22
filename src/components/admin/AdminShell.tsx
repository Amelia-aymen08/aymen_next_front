"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, Suspense, useContext, useEffect, useState } from "react";
import { adminFetch, getToken, setToken, type AdminUser } from "@/lib/adminApi";

const UserContext = createContext<AdminUser | null>(null);

const NAV = [
  { href: "/admin/projets", label: "Projets" },
  { href: "/admin/localites", label: "Localités" },
  { href: "/admin/blog", label: "Articles" },
];
export const useAdminUser = () => useContext(UserContext);

function NavLinks({ current }: { current: string }) {
  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={current.startsWith(item.href) ? "page" : undefined}
          className={current.startsWith(item.href) ? "font-semibold text-[#F7C66A]" : "text-white/80 hover:text-[#F7C66A]"}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

function CurrentNavLinks() {
  return <NavLinks current={usePathname()} />;
}

/** Vérifie la session puis affiche la barre du back-office. Redirige vers /admin/login sinon. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    adminFetch<{ user: AdminUser }>("/me")
      .then((d) => setUser(d.user))
      .catch(() => undefined); // 401 : adminFetch redirige déjà
  }, [router]);

  const logout = () => {
    setToken(null);
    router.replace("/admin/login");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-busy="true">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-[#F7C66A] border-t-transparent" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#031B17]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin/projets" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_original.svg" alt="Aymen Promotion" className="h-8 w-auto" />
              <span className="hidden text-sm font-semibold text-white/80 sm:inline">Back-office</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm" aria-label="Back-office">
              <Suspense fallback={<NavLinks current="" />}>
                <CurrentNavLinks />
              </Suspense>
              <a href="/" target="_blank" rel="noopener" className="hidden text-white/50 hover:text-white sm:inline">
                Voir le site ↗
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/60 md:inline">{user.name || user.email}</span>
            <button type="button" onClick={logout} className="rounded-md border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/10">
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </UserContext.Provider>
  );
}
