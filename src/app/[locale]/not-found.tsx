import { getT } from "@/i18n/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LocaleLink } from "@/i18n/client";

export default async function NotFound() {
  const t = await getT("common");
  return (
    <>
      <Header />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-32 text-center">
        <p className="text-6xl font-bold text-[#F7C66A]">404</p>
        <h1 className="mt-4 text-2xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-2 max-w-md text-white/70">{t("notFoundText")}</p>
        <LocaleLink
          href="/"
          className="mt-8 rounded-full border border-[#F7C66A] px-6 py-2.5 text-sm font-semibold text-[#F7C66A] transition hover:bg-[#F7C66A] hover:text-[#031B17]"
        >
          {t("backHome")}
        </LocaleLink>
      </main>
      <Footer />
    </>
  );
}
