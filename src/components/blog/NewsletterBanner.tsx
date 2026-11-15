"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { useLocale, useT } from "@/i18n/client";
import { API_BASE_URL } from "@/lib/config";
import { getHubspotContext } from "@/lib/legacy/hubspotContext";

export default function NewsletterBanner() {
  const t = useT("blog");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog", lang: locale, ...getHubspotContext() }),
      });
      setStatus({ ok: res.ok, message: res.ok ? t("newsletterSuccess") : t("newsletterError") });
      if (res.ok) setEmail("");
    } catch {
      setStatus({ ok: false, message: t("networkError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      className="relative mt-24 h-auto overflow-hidden rounded-3xl shadow-2xl md:h-[500px]"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/newsletter.png" alt={t("newsletterImageAlt")} className="h-full w-full object-cover rtl:-scale-x-100" />
      </div>

      <div className="relative z-10 flex h-full w-full flex-col md:flex-row">
        <div className="h-64 w-full md:h-full md:w-1/2" />
        <div className="flex w-full flex-col justify-center p-8 text-[#031B17] md:w-1/2 md:p-12">
          <div className="mb-6 flex flex-col items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_black.png" alt="Aymen Promotion" className="mb-2 h-16" />
            <p className="ms-1 font-signature text-xl text-gray-800">{t("newsletterSlogan")}</p>
          </div>

          <h2 className="mb-10 text-3xl font-light leading-tight md:text-5xl">
            {t("newsletterTitle1")}
            <br />
            <span className="font-normal">{t("newsletterTitle2")}</span>
            <br />
            <span className="font-normal">{t("newsletterTitle3")}</span>
          </h2>

          <form onSubmit={submit} className="relative w-full max-w-md rounded-full border border-gray-400">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletterPlaceholder")}
              aria-label={t("newsletterPlaceholder")}
              required
              className="w-full rounded-full border-none bg-transparent py-4 pe-14 ps-6 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label={t("newsletterSubmit")}
              className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-gray-600 transition-colors hover:text-[#031B17] disabled:opacity-50"
            >
              <i className={`fa-solid ${loading ? "fa-spinner fa-spin" : "fa-arrow-right-long rtl:-scale-x-100"} text-xl`} aria-hidden />
            </button>
          </form>
          {status && (
            <p role="status" className={`mt-3 text-sm font-medium ${status.ok ? "text-green-700" : "text-red-600"}`}>
              {status.message}
            </p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
