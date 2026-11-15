"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/legacy/attribution";

const IS_LOCAL = () =>
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

function loadScript(src: string, target: "head" | "body" = "body") {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const s = document.createElement("script");
  s.src = src;
  s.async = true;
  s.crossOrigin = "anonymous";
  document[target].appendChild(s);
}

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  hsConversationsSettings?: { loadImmediately: boolean };
};

/**
 * Effets globaux repris de l'ancien App.js / index.html :
 * - suivi des arrivées via QR code / liens tracés
 * - variable CSS --vh pour les vues mobiles
 * - GTM, Google Analytics et HubSpot chargés en différé (hors localhost)
 */
export default function AppEffects() {
  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    const set = () => {
      const vh = (window.visualViewport?.height ?? window.innerHeight) * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    set();
    window.visualViewport?.addEventListener("resize", set);
    window.addEventListener("resize", set);
    return () => {
      window.visualViewport?.removeEventListener("resize", set);
      window.removeEventListener("resize", set);
    };
  }, []);

  useEffect(() => {
    const w = window as GtagWindow;
    w.hsConversationsSettings = { loadImmediately: false };
    if (IS_LOCAL()) return;

    w.dataLayer = w.dataLayer || [];
    w.gtag = w.gtag || function gtag(...args: unknown[]) { w.dataLayer!.push(args); };

    const analytics = window.setTimeout(() => {
      w.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript("https://www.googletagmanager.com/gtm.js?id=GTM-N8WKJXBX", "head");
      loadScript("https://www.googletagmanager.com/gtag/js?id=G-6EG5WBEP1J", "head");
      w.gtag!("js", new Date());
      w.gtag!("config", "G-6EG5WBEP1J");
    }, 3500);

    const hubspot = window.setTimeout(() => loadScript("https://js-na1.hs-scripts.com/39983056.js"), 5000);

    return () => {
      window.clearTimeout(analytics);
      window.clearTimeout(hubspot);
    };
  }, []);

  return null;
}
