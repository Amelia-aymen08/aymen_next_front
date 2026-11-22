"use client";

import { useEffect, useState } from "react";
import { useDir, useT } from "@/i18n/client";

export type AmenityItem = { label: string; icon?: string };

function AmenityTile({ item }: { item: AmenityItem }) {
  return (
    <>
      <div className="flex h-16 w-16 items-center justify-center transition-all duration-300 group-hover:scale-110 md:h-20 md:w-20">
        {item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.icon}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "/assets/comodites/fenetre.png";
            }}
          />
        ) : (
          <i className="fa-solid fa-check text-3xl text-white group-hover:text-[#F7C66A] md:text-4xl" aria-hidden />
        )}
      </div>
      <span className="max-w-[100px] text-[10px] font-bold uppercase leading-tight tracking-wider text-white transition-colors group-hover:text-[#F7C66A] md:max-w-[120px] md:text-xs">
        {item.label}
      </span>
    </>
  );
}

/** Commodités : liste centrée jusqu'à 6, carrousel au-delà (3 par vue sur mobile, 6 sur ordinateur). */
export default function AmenitiesList({ amenities }: { amenities: AmenityItem[] }) {
  const t = useT("projects");
  const dir = useDir();
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(6);

  useEffect(() => {
    const update = () => setPerView(window.innerWidth < 768 ? 3 : 6);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (amenities.length <= 6) {
    return (
      <section className="px-2 py-16 md:px-6">
        <ul className="mx-auto flex max-w-7xl flex-wrap justify-center gap-6 md:gap-20">
          {amenities.map((a) => (
            <li key={a.label} className="group flex flex-col items-center gap-4 text-center">
              <AmenityTile item={a} />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const n = amenities.length;
  const items = [...amenities, ...amenities, ...amenities];
  const sign = dir === "rtl" ? 1 : -1;
  const arrow = "absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#031B17]/80 p-2 text-[#F7C66A] shadow-lg transition-colors hover:bg-[#F7C66A] hover:text-[#031B17] md:p-3";

  return (
    <section className="overflow-hidden px-2 py-16 md:px-6">
      <div className="relative mx-auto max-w-7xl">
        <button type="button" onClick={() => setIndex((i) => (i - 1 + n) % n)} aria-label={t("amenitiesPrev")} className={`${arrow} start-0 md:-start-8`}>
          <i className="fa-solid fa-chevron-left text-lg rtl:rotate-180 md:text-xl" aria-hidden />
        </button>
        <div className="overflow-hidden px-8 md:px-12">
          <ul className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(${sign * index * (100 / perView)}%)` }}>
            {items.map((a, i) => (
              <li
                key={i}
                aria-hidden={i < index || i >= index + perView}
                className="group flex w-1/3 flex-none flex-col items-center gap-4 px-2 text-center md:w-1/6 md:px-4"
              >
                <AmenityTile item={a} />
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={() => setIndex((i) => (i + 1) % n)} aria-label={t("amenitiesNext")} className={`${arrow} end-0 md:-end-8`}>
          <i className="fa-solid fa-chevron-right text-lg rtl:rotate-180 md:text-xl" aria-hidden />
        </button>
      </div>
    </section>
  );
}
