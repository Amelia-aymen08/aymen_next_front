"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LocaleLink, useLocale, useT } from "@/i18n/client";
import { API_BASE_URL } from "@/lib/config";
import { getHubspotContext } from "@/lib/legacy/hubspotContext";
import { getLocalities, localityShortName, localitySlug } from "@/data/localities.i18n";
import { LOCALITIES } from "@/data/mockData";
import { slugify } from "@/lib/catalogShared";

const GOLD = "#F7C66A";
const LABEL_GOLD = "#F4CE86";

// Sélection éditoriale des résidences mises en avant (reprise du Figma).
const FEATURED_RESIDENCES = ["Séraphinite", "Célestine", "Cyanite", "Citrine", "Azurite", "Larimar"];

const EXPLORE_LINKS = [
  { key: "home", href: "/" },
  { key: "about", href: "/a-propos" },
  { key: "achievements", href: "/projets" },
  { key: "virtualTour", href: "/visite-virtuelle" },
  { key: "blog", href: "/blog" },
  { key: "careers", href: "/carriere" },
  { key: "contact", href: "/contact" },
] as const;

const SOCIAL_LINKS = [
  { icon: "fa-facebook-f", href: "https://www.facebook.com/aymenpromotionimmobiliere", label: "Facebook" },
  { icon: "fa-x-twitter", href: "https://x.com/AymenPromotion", label: "X" },
  { icon: "fa-youtube", href: "https://www.youtube.com/@aymenpromotionimmobiliere6948", label: "YouTube" },
  { icon: "fa-instagram", href: "https://www.instagram.com/aymenpromotion/", label: "Instagram" },
  { icon: "fa-linkedin-in", href: "https://www.linkedin.com/company/aymen-promotion-immobiliere/", label: "LinkedIn" },
  { icon: "fa-tiktok", href: "https://www.tiktok.com/@aymenpromotionimmo", label: "TikTok" },
];

export default function Footer() {
  const t = useT("footer");
  const locale = useLocale();
  const localities = getLocalities(locale);
  // L'année est calculée côté navigateur : une valeur figée au build serait
  // fausse après le 1er janvier (et Next refuse new Date() au prérendu).
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => setYear(new Date().getFullYear()), []);
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [newsEmail, setNewsEmail] = useState("");
  const [newsStatus, setNewsStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);

  const handleNewsletter = async (e: FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    setNewsLoading(true);
    setNewsStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsEmail, source: "footer", lang: locale, ...getHubspotContext() }),
      });
      // Le message du backend est en français : on affiche le nôtre, traduit.
      setNewsStatus({ ok: res.ok, message: res.ok ? t("newsletterSuccess") : t("newsletterError") });
      if (res.ok) setNewsEmail("");
    } catch {
      setNewsStatus({ ok: false, message: t("networkError") });
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <footer ref={ref} className="relative -mt-1 overflow-hidden bg-[#031B17] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 500px at 12% 10%, rgba(21,105,83,0.35), rgba(3,27,23,0) 65%)," +
              "radial-gradient(600px 460px at 90% 0%, rgba(225,187,127,0.14), rgba(3,27,23,0) 68%)",
          }}
        />
      </div>

      <div
        className={`relative z-10 mx-auto w-full max-w-7xl px-6 pb-8 pt-16 transition-all duration-700 ease-out md:px-10 md:pt-20 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
          <div className="space-y-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_original.svg" alt={t("logoAlt")} className="h-12 w-auto" />

            <p className="text-sm leading-relaxed text-white/90">
              <strong className="font-semibold">{t("introStrong")}</strong>
              {t("introAfterStrong")}
              <br />
              {t("introYearsBefore")}
              <strong className="font-bold">{t("introYears")}</strong>
              {t("introYearsAfter")}
              <br />
              {t("introLast")}
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { bold: t("statYearsBold"), rest: t("statYearsRest") },
                { bold: "", rest: t("statCommunes") },
                { bold: t("statDeliveredBold"), rest: t("statDeliveredRest") },
              ].map((s) => (
                <span
                  key={s.rest}
                  className="rounded-[8px] px-4 py-1.5 text-xs text-white backdrop-blur-[7.5px]"
                  style={{ background: "rgba(255,255,255,0.2)", boxShadow: "0px 4px 4px 0px rgba(0,0,0,0.25)" }}
                >
                  {s.bold && <strong className="font-bold">{s.bold} </strong>}
                  {s.rest}
                </span>
              ))}
            </div>

            <div>
              <h3 className="mb-2 text-lg font-bold uppercase tracking-wide" style={{ color: GOLD }}>
                {t("newsletterTitle")}
              </h3>
              <p className="mb-4 text-sm text-white/80">{t("newsletterText")}</p>
              <form
                onSubmit={handleNewsletter}
                className="flex h-12 items-center justify-between gap-3 rounded-xl border border-white px-5 text-sm text-white/60"
              >
                <input
                  type="email"
                  value={newsEmail}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  placeholder={t("newsletterPlaceholder")}
                  aria-label={t("newsletterPlaceholder")}
                  required
                  className="w-full bg-transparent text-white outline-none placeholder:text-white/60"
                />
                <button
                  type="submit"
                  disabled={newsLoading}
                  aria-label={t("newsletterSubmit")}
                  className="shrink-0 text-white transition-colors hover:text-[#F7C66A] disabled:opacity-50"
                >
                  <span className="inline-block rtl:-scale-x-100" aria-hidden>→</span>
                </button>
              </form>
              {newsStatus && (
                <p role="status" className={`mt-2 text-xs ${newsStatus.ok ? "text-green-400" : "text-red-400"}`}>
                  {newsStatus.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 transition hover:text-[#F7C66A]"
                  aria-label={s.label}
                >
                  <i className={`fa-brands ${s.icon} text-base`} aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10">
              <div className="min-w-0 space-y-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: LABEL_GOLD }}>
                  {t("ourResidences")}
                </p>
                <div className="flex flex-col gap-2 text-white/80">
                  {FEATURED_RESIDENCES.map((name) => (
                    <LocaleLink key={name} href={`/projet/${slugify(name)}`} className="transition hover:text-[#F7C66A]">
                      {t("residence", { name })}
                    </LocaleLink>
                  ))}
                  <LocaleLink href="/projets" className="font-bold" style={{ color: GOLD }}>
                    {t("allResidences")}
                  </LocaleLink>
                </div>
              </div>

              <div className="min-w-0 space-y-3 text-sm">
                <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: LABEL_GOLD }}>
                  {t("explore")}
                </p>
                <div className="flex flex-col gap-2 text-white/80">
                  {EXPLORE_LINKS.map((l) => (
                    <LocaleLink key={l.key} href={l.href} className="transition hover:text-[#F7C66A]">
                      {t(l.key)}
                    </LocaleLink>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[0.1em]" style={{ color: LABEL_GOLD }}>
                {t("contactUs")}
              </p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-location-dot mt-1 shrink-0 text-white/70" aria-hidden />
                  <div>
                    <p className="font-bold text-white">{t("headOffice")}</p>
                    <a
                      href="https://maps.app.goo.gl/YvrothxkmnrYBNHZ9"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:underline"
                    >
                      {t("address1")}
                      <br />
                      {t("address2")}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-phone mt-1 shrink-0 text-white/70" aria-hidden />
                  <div>
                    <p className="font-bold text-white">{t("phone")}</p>
                    <a
                      href="https://wa.me/213560582959"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-white/80 hover:underline"
                      dir="ltr"
                    >
                      +213 560 58 29 59 <i className="fa-brands fa-whatsapp text-[#25D366]" aria-hidden />
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fa-regular fa-clock mt-1 shrink-0 text-white/70" aria-hidden />
                  <div>
                    <p className="font-bold text-white">{t("hours")}</p>
                    <p className="text-white/80">{t("hoursValue")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fa-solid fa-envelope mt-1 shrink-0 text-white/70" aria-hidden />
                  <div>
                    <p className="font-bold text-white">{t("email")}</p>
                    <a href="mailto:contact@aymenpromotion-dz.com" className="text-white/80 hover:underline" dir="ltr">
                      contact@aymenpromotion-dz.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide" style={{ color: GOLD }}>
            {t("communesTitle")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {localities.map((loc, i) => (
              <LocaleLink
                key={loc.id}
                // Le slug reste basé sur le nom français : même URL dans les 3 langues.
                href={`/localite/${localitySlug(LOCALITIES[i])}`}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase transition-colors hover:border-[#F7C66A] hover:text-[#F7C66A] ${
                  i === 0 ? "border-[#F7C66A] text-white" : "border-white/60 text-white/60"
                }`}
              >
                {localityShortName(loc)}
              </LocaleLink>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
          <div suppressHydrationWarning>{t("rights", { year: year ?? "" })}</div>
          <div className="flex items-center gap-6">
            <LocaleLink href="/cgu" className="underline hover:text-white">
              {t("terms")}
            </LocaleLink>
            <LocaleLink href="/confidentialite" className="hover:text-white">
              {t("privacy")}
            </LocaleLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
