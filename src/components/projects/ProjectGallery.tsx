"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDir, useT } from "@/i18n/client";
import { assetUrl } from "@/lib/catalogShared";

/**
 * Galerie photos d'un projet.
 * - Ordinateur : mosaïque (grande photo + 4 vignettes), « +N » sur la dernière si plus de photos.
 * - Mobile : bande défilante (une photo par vue, glisser ou flèches).
 * - Un clic ouvre la visionneuse plein écran : photo entière dans son format d'origine (sans recadrage),
 *   flèches, vignettes, clavier, glisser, zoom.
 */
export default function ProjectGallery({ images, projectName }: { images: string[]; projectName: string }) {
  const t = useT("projects");
  const [openAt, setOpenAt] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const alt = (i: number) => t("photoAlt", { n: i + 1, name: projectName });

  const open = (i: number) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setOpenAt(i);
  };
  const close = useCallback(() => {
    setOpenAt(null);
    lastFocus.current?.focus({ preventScroll: true });
  }, []);

  if (images.length === 0) return null;

  return (
    <section className="px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <span className="mb-1 block font-signature text-4xl text-[#F7C66A]">{t("galleryScript")}</span>
          <h2 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">{t("galleryHeading")}</h2>
        </div>

        <Mosaic images={images} alt={alt} onOpen={open} moreLabel={(n) => `+${n}`} openLabel={(i) => t("galleryOpen", { n: i + 1 })} />
        <MobileRail images={images} alt={alt} onOpen={open} openLabel={(i) => t("galleryOpen", { n: i + 1 })} />

        {images.length > 1 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => open(0)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#F7C66A]/50 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#F7C66A] transition hover:bg-[#F7C66A] hover:text-[#031B17]"
            >
              <i className="fa-solid fa-images" aria-hidden />
              {t("galleryAll", { n: images.length })}
            </button>
          </div>
        )}
      </div>

      {openAt !== null && <Lightbox images={images} start={openAt} alt={alt} projectName={projectName} onClose={close} />}
    </section>
  );
}

/* ---------- Mosaïque (ordinateur) ---------- */

function Mosaic({
  images,
  alt,
  onOpen,
  openLabel,
  moreLabel,
}: {
  images: string[];
  alt: (i: number) => string;
  onOpen: (i: number) => void;
  openLabel: (i: number) => string;
  moreLabel: (n: number) => string;
}) {
  const shown = images.slice(0, 5);
  const rest = images.length - shown.length;
  const n = shown.length;
  // Disposition selon le nombre de photos.
  const grid =
    n === 1 ? "grid-cols-1 grid-rows-1" : n === 2 ? "grid-cols-2 grid-rows-1" : n === 3 ? "grid-cols-3 grid-rows-2" : "grid-cols-4 grid-rows-2";
  const span = (i: number) => {
    if (i === 0 && n >= 3) return "col-span-2 row-span-2";
    if (i === 1 && n === 4) return "col-span-2";
    return "";
  };

  return (
    <div className={`hidden h-[520px] gap-2 overflow-hidden rounded-3xl md:grid ${grid}`}>
      {shown.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={openLabel(i)}
          className={`group relative min-h-0 overflow-hidden bg-[#2C4A44] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#F7C66A] ${span(i)}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl(img)}
            alt={alt(i)}
            loading="lazy"
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          {i === 0 && (
            <span className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white" aria-hidden>
              <i className="fa-solid fa-up-right-and-down-left-from-center text-sm" />
            </span>
          )}
          {i === n - 1 && rest > 0 && (
            <span className="absolute inset-0 flex items-center justify-center bg-[#031B17]/60 text-3xl font-bold text-white" aria-hidden dir="ltr">
              {moreLabel(rest)}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------- Bande défilante (mobile) ---------- */

function MobileRail({
  images,
  alt,
  onOpen,
  openLabel,
}: {
  images: string[];
  alt: (i: number) => string;
  onOpen: (i: number) => void;
  openLabel: (i: number) => string;
}) {
  const t = useT("projects");
  const dir = useDir();
  const rail = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const step = () => {
    const first = rail.current?.firstElementChild as HTMLElement | null;
    return first ? first.getBoundingClientRect().width + 8 : 1;
  };
  const onScroll = () => {
    if (!rail.current) return;
    setCurrent(Math.min(images.length - 1, Math.max(0, Math.round(Math.abs(rail.current.scrollLeft) / step()))));
  };
  const go = (delta: number) => {
    const target = (current + delta + images.length) % images.length;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.current?.scrollTo({ left: (dir === "rtl" ? -1 : 1) * target * step(), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="md:hidden">
      <div
        ref={rail}
        onScroll={onScroll}
        className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i)}
            aria-label={openLabel(i)}
            className={`relative aspect-[4/3] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#2C4A44] ${images.length === 1 ? "w-full" : "w-[88%]"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={assetUrl(img)} alt={alt(i)} loading="lazy" draggable={false} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-white/60" aria-live="polite" dir="ltr">
            {t("galleryCounter", { n: current + 1, total: images.length })}
          </span>
          <div className="flex gap-2">
            <RoundButton label={t("galleryPrev")} onClick={() => go(-1)} icon="fa-chevron-left" />
            <RoundButton label={t("galleryNext")} onClick={() => go(1)} icon="fa-chevron-right" />
          </div>
        </div>
      )}
    </div>
  );
}

function RoundButton({ label, onClick, icon, light }: { label: string; onClick: () => void; icon: string; light?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-lg transition hover:scale-105 active:scale-95 ${
        light ? "bg-white text-[#031B17]" : "border border-white/15 bg-[#2C4A44] text-white"
      }`}
    >
      <i className={`fa-solid ${icon} rtl:rotate-180`} aria-hidden />
    </button>
  );
}

/* ---------- Visionneuse plein écran ---------- */

function Lightbox({
  images,
  start,
  alt,
  projectName,
  onClose,
}: {
  images: string[];
  start: number;
  alt: (i: number) => string;
  projectName: string;
  onClose: () => void;
}) {
  const t = useT("projects");
  const dir = useDir();
  const [active, setActive] = useState(start);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const many = images.length > 1;

  const show = useCallback(
    (i: number) => {
      setActive((i + images.length) % images.length);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    },
    [images.length]
  );
  const next = useCallback(() => show(active + 1), [show, active]);
  const prev = useCallback(() => show(active - 1), [show, active]);

  // Défilement de la page bloqué + focus sur « Fermer » à l'ouverture.
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  // Vignette active toujours visible.
  useEffect(() => {
    const el = thumbs.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "auto" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && zoom === 1 && many) {
      e.preventDefault();
      const forward = (e.key === "ArrowRight") !== (dir === "rtl");
      if (forward) next();
      else prev();
    } else if (e.key === "Tab") {
      // Le focus reste dans la visionneuse.
      const focusables = Array.from(dialog.current?.querySelectorAll<HTMLElement>("button") ?? []);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  };

  const toggleZoom = () => {
    setZoom((z) => (z > 1 ? 1 : 2));
    setPan({ x: 0, y: 0 });
  };

  // Glisser : change de photo (taille normale) ou déplace la photo zoomée.
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    if (zoom > 1) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || zoom === 1) return;
    setPan({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || zoom > 1 || !many) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      const forward = (dx < 0) !== (dir === "rtl");
      if (forward) next();
      else prev();
    }
  };

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={t("galleryDialog", { name: projectName })}
      dir={dir}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[200] flex flex-col bg-[#031B17] p-3 text-white md:p-6"
    >
      <div className="flex items-center gap-2 pb-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-signature text-2xl text-[#F7C66A] md:text-3xl" dir="ltr">
            {projectName.charAt(0).toUpperCase() + projectName.slice(1).toLowerCase()}
          </p>
          <p className="text-xs text-white/60" aria-live="polite" dir="ltr">
            {t("galleryCounter", { n: active + 1, total: images.length })}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleZoom}
          aria-label={zoom > 1 ? t("galleryUnzoom") : t("galleryZoom")}
          aria-pressed={zoom > 1}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#2C4A44] transition hover:bg-[#F7C66A] hover:text-[#031B17]"
        >
          <i className={`fa-solid ${zoom > 1 ? "fa-magnifying-glass-minus" : "fa-magnifying-glass-plus"}`} aria-hidden />
        </button>
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          aria-label={t("galleryClose")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#2C4A44] transition hover:bg-[#F7C66A] hover:text-[#031B17]"
        >
          <i className="fa-solid fa-xmark text-lg" aria-hidden />
        </button>
      </div>

      <div
        className={`relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl ${zoom > 1 ? "cursor-grab touch-none" : "touch-pan-y"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={active}
          src={assetUrl(images[active])}
          alt={alt(active)}
          draggable={false}
          onDoubleClick={toggleZoom}
          className="max-h-full max-w-full select-none object-contain transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        />
        {many && (
          <>
            <div className="absolute start-2 top-1/2 -translate-y-1/2 md:start-4">
              <RoundButton light label={t("galleryPrev")} onClick={prev} icon="fa-chevron-left" />
            </div>
            <div className="absolute end-2 top-1/2 -translate-y-1/2 md:end-4">
              <RoundButton light label={t("galleryNext")} onClick={next} icon="fa-chevron-right" />
            </div>
          </>
        )}
      </div>

      {many && (
        <div ref={thumbs} className="mt-3 flex gap-2 overflow-x-auto pb-1 md:justify-center [scrollbar-width:thin]" aria-label={t("galleryThumbs")}>
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => show(i)}
              aria-label={t("galleryOpen", { n: i + 1 })}
              aria-current={i === active}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? "border-[#F7C66A]" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={assetUrl(img)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
