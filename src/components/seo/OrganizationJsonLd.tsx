import { SITE_URL, type Locale } from "@/i18n/config";

const DESCRIPTION: Record<Locale, string> = {
  fr: "Promoteur immobilier haut standing à Alger depuis plus de 20 ans. Plus de 30 résidences réalisées dans les communes les plus prisées d'Alger.",
  en: "High-end real estate developer in Algiers for more than 20 years, with over 30 residences built in the city's most sought-after districts.",
  ar: "مرقّي عقاري للسكن الراقي في الجزائر العاصمة منذ أكثر من 20 سنة، أنجز أكثر من 30 إقامة في أرقى بلديات العاصمة.",
};

export default function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${SITE_URL}/#organization`,
    name: "Aymen Promotion Immobilière",
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo_original.svg`,
    telephone: "+213560582959",
    inLanguage: locale,
    sameAs: [
      "https://www.facebook.com/aymenpromotionimmobiliere",
      "https://www.instagram.com/aymenpromotion/",
      "https://www.linkedin.com/company/aymen-promotion-immobiliere/",
      "https://www.youtube.com/@aymenpromotionimmobiliere6948",
      "https://www.tiktok.com/@aymenpromotionimmo",
      "https://x.com/AymenPromotion",
    ],
    areaServed: { "@type": "AdministrativeArea", name: "Alger, Algérie" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "64, Route Nationale N°01, Ilot N°31",
      addressLocality: "Bir Mourad Raïs",
      addressRegion: "Alger",
      postalCode: "16000",
      addressCountry: "DZ",
    },
    description: DESCRIPTION[locale],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
