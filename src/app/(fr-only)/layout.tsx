import type { Metadata } from "next";
import "../globals.css";
import { fontVariables } from "../fonts";
import { SITE_URL } from "@/i18n/config";
import { loadMessages } from "@/i18n/messages";
import { I18nProvider } from "@/i18n/client";
import AppEffects from "@/components/layout/AppEffects";

// Pages servies uniquement en français : dashboards internes, scanners,
// pages événementielles (Batimat, JPO, concours...). Voir src/i18n/frOnlyRoutes.ts.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/favicon.ico" },
};

export default async function FrOnlyLayout({ children }: { children: React.ReactNode }) {
  const messages = await loadMessages("fr");
  return (
    <html lang="fr" dir="ltr" className={fontVariables}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      </head>
      <body>
        <I18nProvider locale="fr" messages={messages}>
          <AppEffects />
          <div className="relative text-white">{children}</div>
        </I18nProvider>
      </body>
    </html>
  );
}
