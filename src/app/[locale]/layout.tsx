import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";
import { dirOf, locales, SITE_URL } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { loadMessages } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";
import AppEffects from "@/components/layout/AppEffects";
import StickyContactBar from "@/components/layout/StickyContactBar";
import CookieBanner from "@/components/layout/CookieBanner";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#031B17",
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    metadataBase: new URL(SITE_URL),
    icons: { icon: "/favicon.ico", apple: "/logo192.png" },
    ...(await pageMetadata({ locale, path: "/" })),
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const messages = await loadMessages(locale);

  return (
    <html lang={locale} dir={dirOf(locale)} className={fontVariables}>
      <head>
        {/* Icônes Font Awesome utilisées dans tout le site (classes fa-*) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
        <OrganizationJsonLd locale={locale} />
      </head>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <AppEffects />
          <div className="relative text-white">
            <StickyContactBar />
            <CookieBanner />
            {children}
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
