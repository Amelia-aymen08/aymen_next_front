"use client";

import type { CSSProperties } from "react";
import { LocaleLink, useT } from "@/i18n/client";
import { assetUrl, localityHref, projectHref, type LocalityPublic, type ProjectSummary } from "@/lib/catalogShared";

export function LocationPinIcon({ className = "text-[#F7C66A]" }: { className?: string }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className={`shrink-0 ${className}`} aria-hidden>
      <path d="M7 9.5C8.38071 9.5 9.5 8.38071 9.5 7C9.5 5.61929 8.38071 4.5 7 4.5C5.61929 4.5 4.5 5.61929 4.5 7C4.5 8.38071 5.61929 9.5 7 9.5Z" fill="currentColor" />
      <path d="M7 0C3.13 0 0 3.13 0 7C0 12.25 7 18 7 18C7 18 14 12.25 14 7C14 3.13 10.87 0 7 0ZM7 10.5C5.07 10.5 3.5 8.93 3.5 7C3.5 5.07 5.07 3.5 7 3.5C8.93 3.5 10.5 5.07 10.5 7C10.5 8.93 8.93 10.5 7 10.5Z" fill="currentColor" />
    </svg>
  );
}

/** Barre d'avancement (projets en cours) ou badge « Avant-première ». Rien pour un projet livré. */
export function ProgressInfo({ project, onImage = false }: { project: ProjectSummary; onImage?: boolean }) {
  const t = useT("projects");
  if (project.status === "livre") return null;
  if (project.status === "bientot") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>
          ✨
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F7C66A]">{t("comingSoon")}</span>
      </div>
    );
  }
  if (project.progressPercent === null) return null;
  const pct = Math.max(0, Math.min(100, project.progressPercent));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className={`text-[10px] font-medium uppercase tracking-wider ${onImage ? "text-white/80" : "text-white/60"}`}>{t("progress")}</span>
        <span className="text-[10px] font-bold text-[#F7C66A]" dir="ltr">
          {pct}%
        </span>
      </div>
      <div
        className={`h-1 w-full rounded-full ${onImage ? "bg-white/20" : "bg-white/10"}`}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t("progress")}
      >
        <div className="h-full rounded-full bg-[#F7C66A] transition-all duration-1000 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Carte « bâtiment détouré » (projets en cours). */
export function ProjectCard({ project, style }: { project: ProjectSummary; style?: CSSProperties }) {
  const t = useT("projects");
  return (
    <LocaleLink
      href={projectHref(project.slug)}
      className="group relative flex h-full animate-fadeInUp overflow-hidden rounded-lg border border-white/5 bg-gradient-to-br from-[#0A2E25] to-[#031B17] shadow-lg transition hover:shadow-2xl"
      style={style}
    >
      <div className="z-10 flex w-[55%] flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="mb-2 leading-tight text-white">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest opacity-70">{t("residence")}</span>
            <span className="text-xl font-bold uppercase tracking-wide text-[#F7C66A] md:text-2xl">{project.title}</span>
          </h3>
          <div className="mb-4 flex items-center gap-2 text-xs font-medium text-white/60">
            <LocationPinIcon />
            <span>{project.locationLabel}</span>
          </div>
          <p className="mb-4 line-clamp-3 text-xs font-light leading-relaxed text-white/60" lang={project.contentLocale}>
            {project.shortDescription}
          </p>
          <div className="mb-6">
            <ProgressInfo project={project} />
          </div>
        </div>
        <span className="w-fit border-b border-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7C66A] transition group-hover:border-white group-hover:text-white">
          {t("discover")}
        </span>
      </div>
      <div className="relative h-full w-[45%]">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assetUrl(project.cardImage || project.coverImage)}
            alt={t("cardImageAlt", { name: project.title })}
            loading="lazy"
            className="h-full w-full object-contain object-center transition duration-700 group-hover:scale-105"
            style={{ filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))" }}
          />
        </div>
      </div>
    </LocaleLink>
  );
}

/** Carte « vue de nuit » : photo pleine carte (projets livrés). */
export function NightProjectCard({ project, style }: { project: ProjectSummary; style?: CSSProperties }) {
  const t = useT("projects");
  return (
    <LocaleLink
      href={projectHref(project.slug)}
      className="group relative h-64 animate-fadeInUp overflow-hidden rounded-lg shadow-lg transition hover:shadow-2xl"
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assetUrl(project.cardImage || project.coverImage)}
        alt={t("cardImageAlt", { name: project.title })}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#052620]/95 via-[#052620]/60 to-transparent rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 z-10 flex w-3/4 flex-col p-6">
        <div>
          <h3 className="mb-2 leading-tight text-white drop-shadow-md">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-widest opacity-70">{t("residence")}</span>
            <span className="text-xl font-bold uppercase tracking-wide text-[#F7C66A]">{project.title}</span>
          </h3>
          <div className="flex items-center gap-2 text-xs font-medium text-[#F7C66A] drop-shadow-md">
            <LocationPinIcon />
            <span>{project.locationLabel}</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <p className="line-clamp-3 w-[90%] text-xs font-medium leading-relaxed text-white/90 drop-shadow-md" lang={project.contentLocale}>
            {project.shortDescription}
          </p>
          <div className="mt-4 w-[90%]">
            <ProgressInfo project={project} onImage />
          </div>
        </div>
        <span className="w-fit border-b border-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7C66A] drop-shadow-md transition group-hover:border-white group-hover:text-white">
          {t("discover")}
        </span>
      </div>
    </LocaleLink>
  );
}

export function LocalityCard({ locality, style }: { locality: LocalityPublic; style?: CSSProperties }) {
  return (
    <LocaleLink
      href={localityHref(locality.slug)}
      className="group relative flex h-full animate-fadeInUp items-center overflow-hidden rounded-lg bg-[#243c38] shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition hover:bg-[#243c38]/90"
      style={style}
    >
      <div className="relative flex w-[35%] shrink-0 flex-col items-center justify-center py-8 pe-2 ps-4">
        {locality.iconImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={assetUrl(locality.iconImage)} alt="" loading="lazy" className="h-20 w-20 object-contain opacity-90 drop-shadow-xl" />
        )}
      </div>
      <div className="h-24 w-px bg-[#F7C66A] opacity-60" />
      <div className="flex flex-1 flex-col justify-center p-5">
        <h3 className="mb-2 text-sm font-bold uppercase leading-tight tracking-wider text-[#F7C66A]">{locality.name}</h3>
        <p className="line-clamp-4 text-xs font-medium leading-relaxed text-white opacity-90" lang={locality.contentLocale}>
          {locality.description}
        </p>
      </div>
    </LocaleLink>
  );
}
