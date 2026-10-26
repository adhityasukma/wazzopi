"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaLink: string | null;
};

const INTERVAL = 6000;

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const go = useCallback((i: number) => setIndex(((i % total) + total) % total), [total]);

  useEffect(() => {
    if (paused || total < 2) return;
    const t = setTimeout(() => go(index + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, total, go]);

  if (total === 0) return null;

  return (
    <section
      className="relative h-[560px] overflow-hidden bg-espresso-900 md:h-[640px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.id}
            className={cn("absolute inset-0 transition-opacity duration-1000 ease-out", active ? "z-10 opacity-100" : "z-0 opacity-0")}
            aria-hidden={!active}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn("object-cover transition-transform duration-[7000ms] ease-out", active ? "scale-105" : "scale-100")}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-espresso-900/85 via-espresso-900/55 to-espresso-900/10" />
            <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
              {active && (
                <div className="max-w-xl text-cream">
                  <p className="animate-fade-up mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-caramel-200">
                    <span className="h-px w-8 bg-caramel-300" />
                    Wazzopi
                  </p>
                  <h1 className="animate-fade-up text-4xl font-semibold leading-tight md:text-6xl" style={{ animationDelay: "120ms" }}>
                    {s.title}
                  </h1>
                  {s.subtitle && (
                    <p className="animate-fade-up mt-5 text-base leading-relaxed text-espresso-100 md:text-lg" style={{ animationDelay: "240ms" }}>
                      {s.subtitle}
                    </p>
                  )}
                  {s.ctaLabel && s.ctaLink && (
                    <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
                      <Link
                        href={s.ctaLink}
                        className="inline-flex h-12 items-center gap-2 rounded-lg bg-cream px-6 text-sm font-semibold text-espresso-800 transition-colors hover:bg-white"
                      >
                        {s.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/products"
                        className="inline-flex h-12 items-center gap-2 rounded-lg border border-cream/40 px-6 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                      >
                        Lihat Katalog
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {total > 1 && (
        <>
          <div className="absolute bottom-8 left-0 right-0 z-20">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
              <div className="flex items-center gap-3">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(i)}
                    className="group relative h-1 w-12 overflow-hidden rounded-full bg-cream/30"
                    aria-label={`Slide ${i + 1}`}
                  >
                    <span
                      key={`${index}-${paused}`}
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full bg-cream",
                        i < index && "w-full",
                        i > index && "w-0",
                      )}
                      style={
                        i === index
                          ? { animation: `hero-progress ${INTERVAL}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }
                          : undefined
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 font-display text-sm text-cream/80">
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => go(index - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/40 text-cream transition-colors hover:bg-cream hover:text-espresso-800"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => go(index + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/40 text-cream transition-colors hover:bg-cream hover:text-espresso-800"
                  aria-label="Berikutnya"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
        </>
      )}
    </section>
  );
}
