"use client";

import { useEffect, useState } from "react";
import { useDir, useT } from "@/i18n/client";
import { assetUrl } from "@/lib/catalogShared";

/** Galerie photos : 1 photo par vue sur mobile, 3 sur ordinateur, défilement en boucle. */
export default function ProjectGallery({ images, projectName }: { images: string[]; projectName: string }) {
  const t = useT("projects");
  const dir = useDir();
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Assez de photos pour remplir la bande même avec une galerie courte.
  const strip = images.length < perView * 2 ? [...images, ...images, ...images] : [...images, ...images];
  const max = Math.max(0, strip.length - perView);
  const next = () => setIndex((i) => (i >= max ? 0 : i + 1));
  const prev = () => setIndex((i) => (i <= 0 ? max : i - 1));
  const sign = dir === "rtl" ? 1 : -1;
  const arrow =
    "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#031B17] shadow-xl transition hover:scale-110 active:scale-95";

  return (
    <section className="px-4 py-20 md:px-8">
      <div className="relative mx-auto max-w-7xl">
        {images.length > perView && (
          <>
            <button type="button" onClick={prev} aria-label={t("galleryPrev")} className={`${arrow} start-0 -translate-x-2 md:-start-12 md:translate-x-0`}>
              <i className="fa-solid fa-chevron-left rtl:rotate-180" aria-hidden />
            </button>
            <button type="button" onClick={next} aria-label={t("galleryNext")} className={`${arrow} end-0 translate-x-2 md:-end-12 md:translate-x-0`}>
              <i className="fa-solid fa-chevron-right rtl:rotate-180" aria-hidden />
            </button>
          </>
        )}
        <div className="overflow-hidden px-2 md:px-0">
          <ul className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(${sign * index * (100 / perView)}%)` }}>
            {strip.map((img, i) => (
              <li key={i} className="flex-shrink-0 px-3" style={{ width: `${100 / perView}%` }} aria-hidden={i < index || i >= index + perView}>
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assetUrl(img)}
                    alt={t("photoAlt", { n: (i % images.length) + 1, name: projectName })}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
