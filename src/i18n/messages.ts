import type fr from "./messages/fr.json";
import type { Locale } from "./config";

// Le fichier français fait référence : en.json et ar.json doivent avoir les mêmes clés
// (vérifié par `npm run i18n:check`).
export type Messages = typeof fr;
export type Namespace = keyof Messages;

const loaders: Record<Locale, () => Promise<Messages>> = {
  fr: () => import("./messages/fr.json").then((m) => m.default),
  en: () => import("./messages/en.json").then((m) => m.default as Messages),
  ar: () => import("./messages/ar.json").then((m) => m.default as Messages),
};

export function loadMessages(locale: Locale): Promise<Messages> {
  return loaders[locale]();
}

/** Remplace les {variables} d'un message. */
export function format(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function makeT<N extends Namespace>(messages: Messages, ns: N) {
  const dict = messages[ns] as Record<string, string>;
  return (key: keyof Messages[N] & string, vars?: Record<string, string | number>): string => {
    const value = dict?.[key];
    return value === undefined ? `${ns}.${key}` : format(value, vars);
  };
}
