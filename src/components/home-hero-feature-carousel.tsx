"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useEffect } from "react";
import { resolveHomeFeatureIcon } from "@/lib/home-features";
import type { HomeHeroFeature } from "@/lib/home-hero-features";
import { cn } from "@/lib/utils";

const ROTATE_MS = 4000;

export function HomeHeroFeatureCarousel({ features }: { features: HomeHeroFeature[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: true,
    watchDrag: false,
    duration: 30,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const interval = window.setInterval(() => {
      emblaApi.scrollNext();
    }, ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [emblaApi]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm sm:rounded-3xl"
      aria-label="Преимущества"
      aria-live="polite"
    >
      <div ref={emblaRef} className="h-[5.5rem] overflow-hidden sm:h-[6rem] lg:h-full lg:min-h-[12.5rem]">
        <div className="flex h-full flex-col">
          {features.map((feature) => {
            const Icon = resolveHomeFeatureIcon(feature.icon);

            return (
              <div
                key={feature.id ?? feature.title}
                className={cn(
                  "flex min-h-0 flex-[0_0_100%] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-5 sm:py-4",
                  "lg:min-h-[12.5rem] lg:items-start lg:py-6",
                )}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/10 text-lime sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold leading-snug text-graphite sm:text-sm lg:text-base">
                    {feature.title}
                  </div>
                  {feature.text ? (
                    <div className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-muted sm:text-xs sm:leading-5 lg:line-clamp-3 lg:text-sm lg:leading-6">
                      {feature.text}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
