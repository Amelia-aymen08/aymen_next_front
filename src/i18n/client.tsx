"use client";

import NextLink from "next/link";
import { createContext, useContext, useMemo, type ComponentProps } from "react";
import { dirOf, localizePath, type Locale } from "./config";
import { makeT, type Messages, type Namespace } from "./messages";

type I18nValue = { locale: Locale; messages: Messages };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, messages, children }: I18nValue & { children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18nContext(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT/useLocale doivent être utilisés sous <I18nProvider>");
  return ctx;
}

export function useLocale(): Locale {
  return useI18nContext().locale;
}

export function useDir(): "ltr" | "rtl" {
  return dirOf(useLocale());
}

/** Traducteur côté client : const t = useT("header"); t("menu") */
export function useT<N extends Namespace>(ns: N) {
  const { messages } = useI18nContext();
  return useMemo(() => makeT(messages, ns), [messages, ns]);
}

/** Construit un lien dans la langue courante : href("/projets") -> "/en/projets". */
export function useHref() {
  const locale = useLocale();
  return (path: string) => localizePath(locale, path);
}

/**
 * Lien interne qui garde la langue courante.
 * <LocaleLink href="/projets"> pointe vers /projets, /en/projets ou /ar/projets.
 */
export function LocaleLink({ href, ...rest }: Omit<ComponentProps<typeof NextLink>, "href"> & { href: string }) {
  const locale = useLocale();
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  return <NextLink href={isInternal ? localizePath(locale, href) : href} {...rest} />;
}
