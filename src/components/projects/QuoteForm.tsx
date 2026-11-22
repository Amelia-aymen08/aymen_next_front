"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocale, useT } from "@/i18n/client";
import { API_BASE_URL } from "@/lib/config";
import { getHubspotContext } from "@/lib/legacy/hubspotContext";
import {
  BUDGETS,
  CONTACT_TIMES,
  COUNTRIES,
  DAYS,
  FINANCING,
  INTERESTS,
  LOCATIONS,
  PROFESSIONS,
  PROJECT_STATUSES,
  WILAYAS,
  optionLabel,
  type QuoteOption,
} from "@/lib/quoteOptions";

type FormState = {
  email: string;
  lastName: string;
  firstName: string;
  phone: string;
  country: string;
  wilaya: string;
  budget: string;
  profession: string;
  financing: string;
  interest: string;
  locations: string[];
  contactDays: string[];
  contactTime: string;
  projectStatus: string;
  consent: boolean;
};

const EMPTY: FormState = {
  email: "",
  lastName: "",
  firstName: "",
  phone: "",
  country: "Algérie",
  wilaya: "",
  budget: "",
  profession: "",
  financing: "",
  interest: "",
  locations: [],
  contactDays: [],
  contactTime: "",
  projectStatus: "",
  consent: false,
};

/** Formulaire de devis d'une page projet -> POST /api/quotes (puis Odoo / HubSpot côté backend). */
export default function QuoteForm({ projectTitle }: { projectTitle: string }) {
  const t = useT("quote");
  const locale = useLocale();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value, ...(name === "country" && value !== "Algérie" ? { wilaya: "" } : {}) }));
  };
  const toggle = (key: "locations" | "contactDays", value: string, checked: boolean) =>
    setForm((f) => ({ ...f, [key]: checked ? [...f[key], value] : f[key].filter((v) => v !== value) }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.contactDays.length) {
      setError(t("errorDays"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // sourceProject = nom du projet : il sert à retrouver la résidence dans Odoo.
        body: JSON.stringify({ ...form, sourceProject: projectTitle, ...getHubspotContext() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        setSent(true);
        setForm(EMPTY);
      } else {
        setError(data.message || t("errorGeneric"));
      }
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-20" id="devis">
        <div className="mx-auto max-w-3xl rounded-lg border border-green-500 bg-green-500/20 p-12 text-center" role="status">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/30">
            <i className="fa-solid fa-check text-5xl text-green-300" aria-hidden />
          </div>
          <h3 className="mb-4 text-3xl font-medium text-green-300">{t("successTitle")}</h3>
          <p className="mb-8 text-lg text-green-200">{t("successText")}</p>
          <button type="button" onClick={() => setSent(false)} className="rounded-lg bg-green-600 px-10 py-4 text-lg font-medium text-white shadow-md transition-colors hover:bg-green-700">
            {t("newRequest")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-20" id="devis">
      <h2 className="mb-12 text-3xl font-bold uppercase tracking-wide text-white">{t("title")}</h2>
      <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <Input label={t("email")} name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t("lastName")} name="lastName" autoComplete="family-name" value={form.lastName} onChange={onChange} required />
            <Input label={t("firstName")} name="firstName" autoComplete="given-name" value={form.firstName} onChange={onChange} required />
          </div>
          <div className="border-b border-white/20 pt-4">
            <div className="flex items-center gap-2" dir="ltr">
              <div className="flex items-center gap-2 border-r border-white/20 pr-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/w20/dz.png" alt="" className="h-4 w-6 object-cover" />
                <span className="text-white">+213</span>
              </div>
              <input
                type="tel"
                name="phone"
                autoComplete="tel-national"
                aria-label={t("phone")}
                value={form.phone}
                onChange={onChange}
                required
                placeholder={t("phone")}
                className="w-full bg-transparent py-2 text-white placeholder-white/50 transition-colors focus:outline-none focus:placeholder-[#F7C66A]"
              />
            </div>
          </div>
          <Select label={t("country")} name="country" value={form.country} onChange={onChange} options={COUNTRIES} locale={locale} />
          {form.country === "Algérie" && (
            <Select label={t("wilaya")} name="wilaya" value={form.wilaya} onChange={onChange} options={WILAYAS.map((w) => ({ value: w }))} locale={locale} required />
          )}
          <Select label={t("budget")} name="budget" value={form.budget} onChange={onChange} options={BUDGETS} locale={locale} required />
          <Select label={t("profession")} name="profession" value={form.profession} onChange={onChange} options={PROFESSIONS} locale={locale} required />
          <Select label={t("financing")} name="financing" value={form.financing} onChange={onChange} options={FINANCING} locale={locale} required />
          <Select label={t("interest")} name="interest" value={form.interest} onChange={onChange} options={INTERESTS} locale={locale} required />
        </div>

        <div className="space-y-8">
          <Checkboxes legend={t("locations")} options={LOCATIONS} checked={form.locations} onToggle={(v, c) => toggle("locations", v, c)} locale={locale} />
          <Checkboxes legend={t("contactDays")} options={DAYS} checked={form.contactDays} onToggle={(v, c) => toggle("contactDays", v, c)} locale={locale} />
          <Select label={t("contactTime")} name="contactTime" value={form.contactTime} onChange={onChange} options={CONTACT_TIMES} locale={locale} />
          <Select label={t("projectStatus")} name="projectStatus" value={form.projectStatus} onChange={onChange} options={PROJECT_STATUSES} locale={locale} required />
        </div>

        <div className="border-t border-white/10 pt-8 lg:col-span-2">
          <label className="mb-8 flex cursor-pointer items-start gap-3 text-sm text-white/60">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              required
              className="mt-1 h-4 w-4 rounded border-white/30 bg-transparent text-[#F7C66A]"
            />
            <span className="leading-relaxed">{t("consent")}</span>
          </label>

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500 bg-red-500/20 p-4 text-red-200" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 border border-[#F7C66A] bg-[#F7C66A] py-4 text-sm font-bold uppercase tracking-widest text-[#031B17] transition hover:bg-transparent hover:text-[#F7C66A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#031B17] border-t-transparent" aria-hidden />}
            {loading ? t("sending") : t("submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="border-b border-white/20 pt-4">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        aria-label={label}
        placeholder={label}
        className="w-full bg-transparent py-2 text-white placeholder-white/50 transition-colors focus:outline-none focus:placeholder-[#F7C66A]"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  value,
  onChange,
  required,
  locale,
}: {
  label: string;
  name: string;
  options: QuoteOption[];
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  locale: ReturnType<typeof useLocale>;
}) {
  return (
    <div className="relative border-b border-white/20 pt-4">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        aria-label={label}
        className="w-full appearance-none bg-transparent py-2 pe-6 text-white/70 focus:text-white focus:outline-none [&>option]:bg-[#031B17]"
      >
        <option value="" disabled>
          {label}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-white">
            {optionLabel(o, locale)}
          </option>
        ))}
      </select>
      <i className="fa-solid fa-chevron-down pointer-events-none absolute end-0 top-1/2 mt-2 -translate-y-1/2 text-xs text-white/50" aria-hidden />
    </div>
  );
}

function Checkboxes({
  legend,
  options,
  checked,
  onToggle,
  locale,
}: {
  legend: string;
  options: QuoteOption[];
  checked: string[];
  onToggle: (value: string, checked: boolean) => void;
  locale: ReturnType<typeof useLocale>;
}) {
  return (
    <fieldset>
      <legend className="mb-4 block text-sm font-bold uppercase text-[#F7C66A]">{legend}</legend>
      <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-3">
        {options.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-3 text-white/80 hover:text-white">
            <input
              type="checkbox"
              value={o.value}
              checked={checked.includes(o.value)}
              onChange={(e) => onToggle(o.value, e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-transparent text-[#F7C66A] focus:ring-[#F7C66A]"
            />
            <span className="text-sm">{optionLabel(o, locale)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
