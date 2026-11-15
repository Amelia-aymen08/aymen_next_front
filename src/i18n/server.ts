import { locale as localeParam } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import { loadMessages, makeT, type Namespace } from "./messages";

/** Langue de la requête en cours (Server Components uniquement). */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getMessages() {
  return loadMessages(await getLocale());
}

/** Traducteur côté serveur : const t = await getT("footer"); t("contactUs") */
export async function getT<N extends Namespace>(ns: N) {
  return makeT(await getMessages(), ns);
}
