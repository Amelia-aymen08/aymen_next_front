import type { Locale } from "@/i18n/config";
import { LOCALITIES, type Locality } from "./mockData";
import { slugify } from "@/lib/catalogShared";

// Traductions des localités (clé = id de LOCALITIES dans mockData.ts).
// Le français reste la source dans mockData.ts.
// ⚠️ Traduction IA à faire relire par un locuteur natif avant mise en ligne.
type LocalityText = { name: string; description: string };

const EN: Record<number, LocalityText> = {
  1: { name: "KOUBA, ALGIERS", description: "Set on the heights of Algiers, Kouba is a sought-after residential district known for its pleasant lifestyle and proximity to the city centre. It strikes the perfect balance between calm and accessibility, with many amenities close by." },
  2: { name: "HYDRA, ALGIERS", description: "Proudly perched on the heights of Algiers, Hydra is one of the capital's most prestigious districts. Renowned for its embassies, luxury residences and green spaces, it embodies elegance and refinement." },
  3: { name: "BIRKHADEM, ALGIERS", description: "Once famous for its vast orchards, Birkhadem has kept its character while growing harmoniously. This residential district offers a peaceful setting close to the capital's main roads." },
  4: { name: "DAR EL BEIDA, ALGIERS", description: "The strategic gateway to Algiers with its international airport, Dar El Beida is a fast-growing economic hub. The district combines commercial energy with developing residential areas." },
  5: { name: "DELY IBRAHIM, ALGIERS", description: "Dely Ibrahim is prized for its green surroundings and quality of life. Its elegant villas and modern residences make it a favourite with families." },
  6: { name: "BAB EZZOUAR, ALGIERS", description: "A major university and technology hub, Bab Ezzouar is a dynamic, modern district. Its large shopping centre, universities and business parks make it a lively, well-connected place to live." },
  7: { name: "CHÉRAGA, ALGIERS", description: "Set on the heights of Algiers, Chéraga is a residential town that has kept its authentic character. It offers a pleasant lifestyle with quiet, leafy neighbourhoods." },
  8: { name: "DRARIA, ALGIERS", description: "Proudly perched on the heights of Algiers, Draria is a fast-growing residential district. It appeals with its pleasant lifestyle and proximity to the main roads." },
  9: { name: "EL ACHOUR, ALGIERS", description: "Neighbouring Draria and Dely Ibrahim, El Achour is a peaceful residential district offering residents a pleasant lifestyle. Its quiet streets and green spaces make it a popular place to live." },
  10: { name: "SAID HAMDINE, ALGIERS", description: "A residential and administrative district, Said Hamdine is known for its pleasant lifestyle and proximity to the city centre. Its tree-lined streets and high-end residences make it a sought-after address." },
  11: { name: "RUISSEAU, ALGIERS", description: "A strategic crossroads between the city centre and the heights of Algiers, Le Ruisseau is a lively, well-served district. It offers an urban lifestyle with every amenity close at hand." },
  12: { name: "CHEVALLEY, ALGIERS", description: "Chevalley is a prestigious district in the municipality of Bouzaréah, Algiers. Strategically located where the residential areas of El Biar and Ben Aknoun meet, it enjoys excellent links to the main roads, making every part of Algiers easy to reach. At its heart lies an area renowned for contemporary luxury villas and an exceptional level of security. The district offers a full range of local amenities, from traditional markets and shops to restaurants and friendly cafés. Universities, hospitals, beauty institutes and modern gyms complete an environment designed for everyday well-being. Leisure lovers enjoy the nearby 5 Juillet sports complex and a golf course, while Dounia Park and the Ben Aknoun forest offer real outdoor escapes, ideal for recharging with the family. Blending architectural heritage and modernity, Chevalley has become one of the most sought-after residential addresses in Algiers." },
};

const AR: Record<number, LocalityText> = {
  1: { name: "القبة، الجزائر العاصمة", description: "تقع القبة على مرتفعات الجزائر العاصمة، وهي حيّ سكني مرغوب بفضل نمط عيشه المريح وقربه من وسط المدينة. تحقّق توازنًا مثاليًا بين الهدوء وسهولة الوصول، مع العديد من المرافق القريبة." },
  2: { name: "حيدرة، الجزائر العاصمة", description: "تتربّع حيدرة على مرتفعات الجزائر العاصمة، وهي من أرقى أحياء العاصمة. تشتهر بسفاراتها وإقاماتها الفاخرة ومساحاتها الخضراء، وتجسّد الأناقة والرقيّ." },
  3: { name: "بئر خادم، الجزائر العاصمة", description: "اشتهرت بئر خادم قديمًا ببساتينها الواسعة، وحافظت على روحها مع نموّ متناغم. يوفّر هذا الحيّ السكني إطار حياة هادئًا بالقرب من المحاور الرئيسية للعاصمة." },
  4: { name: "الدار البيضاء، الجزائر العاصمة", description: "بوابة استراتيجية للعاصمة بفضل مطارها الدولي، الدار البيضاء قطب اقتصادي في توسّع مستمر، يجمع بين الحيوية التجارية ومناطق سكنية في طور التطوّر." },
  5: { name: "دالي إبراهيم، الجزائر العاصمة", description: "تحظى دالي إبراهيم بإقبال كبير بفضل محيطها الأخضر وجودة الحياة فيها. فيلاتها الأنيقة وإقاماتها العصرية تجعلها وجهة سكنية مفضّلة لدى العائلات." },
  6: { name: "باب الزوار، الجزائر العاصمة", description: "قطب جامعي وتكنولوجي رئيسي، باب الزوار حيّ حيوي وعصري. مركزها التجاري الكبير وجامعاتها ومناطق نشاطها تجعل منها مكانًا نابضًا بالحياة وجيّد الربط." },
  7: { name: "الشراقة، الجزائر العاصمة", description: "تقع الشراقة على مرتفعات الجزائر العاصمة، وهي بلدية سكنية حافظت على طابعها الأصيل، وتوفّر إطار حياة مريحًا بأحياء هادئة وخضراء." },
  8: { name: "الدرارية، الجزائر العاصمة", description: "تتربّع الدرارية على مرتفعات الجزائر العاصمة، وهي حيّ سكني في أوج تطوّره، يجذب بإطار حياته المريح وقربه من المحاور الطرقية الرئيسية." },
  9: { name: "العاشور، الجزائر العاصمة", description: "تجاور العاشور الدرارية ودالي إبراهيم، وهي حيّ سكني هادئ يوفّر لسكانه إطار حياة مريحًا. شوارعها الهادئة ومساحاتها الخضراء تجعلها مكانًا مرغوبًا للسكن." },
  10: { name: "سعيد حمدين، الجزائر العاصمة", description: "حيّ سكني وإداري، يشتهر سعيد حمدين بإطار حياته المريح وقربه من وسط المدينة. شوارعه المشجّرة وإقاماته الراقية تجعل منه عنوانًا مرغوبًا." },
  11: { name: "الرويسو، الجزائر العاصمة", description: "ملتقى استراتيجي بين وسط المدينة ومرتفعات العاصمة، الرويسو حيّ حيوي وجيّد الخدمات، يوفّر نمط حياة حضريًا مع جميع المرافق القريبة." },
  12: { name: "شوفالي، الجزائر العاصمة", description: "شوفالي حيّ راقٍ يقع في بلدية بوزريعة بالجزائر العاصمة. يتميّز بموقع استراتيجي عند ملتقى الأحياء السكنية للأبيار وبن عكنون، ويستفيد من ربط ممتاز بالمحاور الطرقية الكبرى، ما يسهّل الوصول إلى جميع بلديات العاصمة. وفي قلب هذا القطاع المرغوب يقع محيط يشتهر بفيلاته الفاخرة ذات التصميم العصري ومستوى أمانه الاستثنائي. ويوفّر الحيّ خدمات جوارية متكاملة تجمع بين الأسواق التقليدية والمحلات والمطاعم والمقاهي ذات الأجواء الودّية. وتكمل المؤسسات الجامعية والهياكل الاستشفائية ومعاهد التجميل وقاعات الرياضة العصرية بيئة مصمّمة للرفاهية اليومية. ويستمتع محبّو الترفيه بقرب المركب الرياضي 5 جويلية وملعب الغولف، بينما توفّر حديقة دنيا وغابة بن عكنون متنفّسًا حقيقيًا في الهواء الطلق، مثاليًا للاسترخاء مع العائلة. وبجمعه بين الإرث المعماري والحداثة، يفرض شوفالي نفسه اليوم كأحد أكثر العناوين السكنية طلبًا في الجزائر العاصمة." },
};

const BY_LOCALE: Partial<Record<Locale, Record<number, LocalityText>>> = { en: EN, ar: AR };

/** Slug d'URL d'une localité : identique dans les 3 langues (basé sur le nom français). */
/** Adresse de la page localité : « CHÉRAGA, ALGER » -> « cheraga » (même règle que le backend). */
export function localitySlug(loc: Pick<Locality, "name">): string {
  return slugify(loc.name.split(",")[0]);
}

export function localizeLocality(loc: Locality, locale: Locale): Locality {
  const t = BY_LOCALE[locale]?.[loc.id];
  return t ? { ...loc, ...t } : loc;
}

export function getLocalities(locale: Locale): Locality[] {
  return LOCALITIES.map((l) => localizeLocality(l, locale));
}

/** Nom court (sans « , Alger ») */
export function localityShortName(loc: Pick<Locality, "name">): string {
  return loc.name.split(/[,،]/)[0].trim();
}
